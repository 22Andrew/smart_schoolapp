package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.CompositeUserDetailsService;
import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.NotificationSetting;
import com.kantechsolution.smart_school.model.PasswordResetToken;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.NotificationSettingRepository;
import com.kantechsolution.smart_school.repository.PasswordResetTokenRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private static final Logger log = LoggerFactory.getLogger(ForgotPasswordService.class);

    public static final String TYPE_STAFF = "STAFF";
    public static final String TYPE_STUDENT = "STUDENT";
    public static final String TYPE_PARENT = "PARENT";

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final AppUserAccountRepository appUserAccountRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final SchoolGeneralSettingService schoolGeneralSettingService;
    private final CompositeUserDetailsService compositeUserDetailsService;
    private final UserLoginAuthService userLoginAuthService;
    private final SystemMailService systemMailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void requestPasswordReset(String email, HttpServletRequest request) {
        String normalizedEmail = normalizeEmail(email);
        if (!StringUtils.hasText(normalizedEmail)) {
            throw new IllegalArgumentException("Email is required.");
        }

        Optional<AccountMatch> match = findAccountByEmail(normalizedEmail);
        if (match.isEmpty()) {
            return;
        }

        AccountMatch account = match.get();
        String tokenValue = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenValue)
                .email(normalizedEmail)
                .username(account.username())
                .accountType(account.accountType())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        token.setIsActive(true);
        passwordResetTokenRepository.save(token);

        String resetLink = buildResetLink(request, tokenValue);
        sendResetEmail(account, normalizedEmail, resetLink);
    }

    @Transactional(readOnly = true)
    public Optional<PasswordResetToken> findValidToken(String token) {
        if (!StringUtils.hasText(token)) {
            return Optional.empty();
        }
        return passwordResetTokenRepository.findByToken(token.trim())
                .filter(row -> !row.isUsed())
                .filter(row -> !row.isExpired());
    }

    @Transactional
    public String resetPassword(String token, String newPassword, String confirmPassword) {
        PasswordResetToken resetToken = findValidToken(token)
                .orElseThrow(() -> new IllegalArgumentException("This password reset link is invalid or has expired."));

        validateNewPassword(newPassword, confirmPassword);

        String username = resetToken.getUsername();
        String encoded = passwordEncoder.encode(newPassword);

        Optional<AppUserAccount> account = userLoginAuthService.findAccount(username);
        if (account.isPresent()) {
            AppUserAccount row = account.get();
            row.setPasswordHash(encoded);
            appUserAccountRepository.save(row);
        } else {
            throw new IllegalArgumentException("Account not found.");
        }

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        return resetToken.getAccountType();
    }

    private void sendResetEmail(AccountMatch account, String email, String resetLink) {
        NotificationSetting setting = notificationSettingRepository.findByEventKey("forgot_password").orElse(null);
        if (setting != null && Boolean.FALSE.equals(setting.getNotifyEmail())) {
            log.warn("Forgot password email notifications are disabled in notification settings.");
        }

        String schoolName = resolveSchoolName();
        String displayName = account.displayName();
        String subject = "Reset your password - " + schoolName;
        String body = buildEmailBody(setting, displayName, account.username(), resetLink, schoolName);

        boolean sent = systemMailService.sendPlainTextEmail(email, subject, body);
        if (!sent) {
            log.warn("Password reset email could not be sent to {}. Reset link: {}", email, resetLink);
        }
    }

    private String buildEmailBody(NotificationSetting setting,
                                    String name,
                                    String username,
                                    String resetLink,
                                    String schoolName) {
        String template = setting != null && StringUtils.hasText(setting.getSampleMessage())
                ? setting.getSampleMessage()
                : "Dear {{name}}, Recently a request was submitted to reset password for your account. "
                + "If you didn't make the request, just ignore this email. Otherwise you can reset your password using this link: "
                + "{{resetPassLink}} Your username: {{username}} Regards, {{school_name}}";

        return template
                .replace("{{name}}", name)
                .replace("{{username}}", username)
                .replace("{{resetPassLink}}", resetLink)
                .replace("{{reset_link}}", resetLink)
                .replace("{{school_name}}", schoolName);
    }

    private Optional<AccountMatch> findAccountByEmail(String email) {
        List<AccountMatch> matches = new ArrayList<>();

        try {
            compositeUserDetailsService.loadUserByUsername(email);
            matches.add(new AccountMatch(email, email, TYPE_STAFF, displayNameForStaffEmail(email)));
        } catch (UsernameNotFoundException ignored) {
            // continue
        }

        staffMemberRepository.findByEmailIgnoreCase(email).ifPresent(staff -> {
            if (matches.stream().noneMatch(match -> email.equalsIgnoreCase(match.username()))) {
                matches.add(new AccountMatch(email, email, TYPE_STAFF, displayNameForStaff(staff)));
            }
        });

        appUserAccountRepository.findByUsernameIgnoreCase(email)
                .filter(account -> UserLoginAuthService.TYPE_STAFF.equals(account.getUserType()))
                .ifPresent(account -> {
                    if (matches.stream().noneMatch(match -> account.getUsername().equalsIgnoreCase(match.username()))) {
                        String displayName = account.getSourceId() == null
                                ? account.getUsername()
                                : staffMemberRepository.findById(account.getSourceId())
                                .map(this::displayNameForStaff)
                                .orElse(account.getUsername());
                        matches.add(new AccountMatch(email, account.getUsername(), TYPE_STAFF, displayName));
                    }
                });

        for (StudentAdmission student : studentAdmissionRepository.findByEmailIgnoreCase(email)) {
            appUserAccountRepository.findByUserTypeAndSourceId(UserLoginAuthService.TYPE_STUDENT, student.getId())
                    .ifPresent(account -> matches.add(new AccountMatch(
                            email,
                            account.getUsername(),
                            TYPE_STUDENT,
                            fullStudentName(student)
                    )));
        }

        for (StudentAdmission student : studentAdmissionRepository.findByGuardianEmailIgnoreCase(email)) {
            appUserAccountRepository.findByUserTypeAndSourceId(UserLoginAuthService.TYPE_PARENT, student.getId())
                    .ifPresent(account -> matches.add(new AccountMatch(
                            email,
                            account.getUsername(),
                            TYPE_PARENT,
                            blankToDefault(student.getGuardianName(), "Parent")
                    )));
        }

        return matches.stream().findFirst();
    }

    private String displayNameForStaffEmail(String email) {
        return staffMemberRepository.findByEmailIgnoreCase(email)
                .map(this::displayNameForStaff)
                .orElse(email.substring(0, email.indexOf('@')));
    }

    private String displayNameForStaff(StaffMember staff) {
        String first = blankToDefault(staff.getFirstName(), "");
        String last = blankToDefault(staff.getLastName(), "");
        String full = (first + " " + last).trim();
        return full.isBlank() ? staff.getEmail() : full;
    }

    private String fullStudentName(StudentAdmission student) {
        String first = blankToDefault(student.getFirstName(), "");
        String last = blankToDefault(student.getLastName(), "");
        return (first + " " + last).trim();
    }

    private String resolveSchoolName() {
        try {
            Map<String, Object> settings = schoolGeneralSettingService.getSettings();
            Object name = settings.get("schoolName");
            if (name != null && !String.valueOf(name).isBlank()) {
                return String.valueOf(name).trim();
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "Mount Carmel School";
    }

    private String buildResetLink(HttpServletRequest request, String token) {
        return ServletUriComponentsBuilder.fromContextPath(request)
                .path("/site/resetpassword/")
                .path(token)
                .build()
                .toUriString();
    }

    private void validateNewPassword(String newPassword, String confirmPassword) {
        if (!StringUtils.hasText(newPassword) || !StringUtils.hasText(confirmPassword)) {
            throw new IllegalArgumentException("Password fields are required.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private record AccountMatch(String email, String username, String accountType, String displayName) {
    }
}
