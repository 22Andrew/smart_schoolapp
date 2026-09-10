package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.CompositeUserDetailsService;
import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ChangePasswordService {

    private final CompositeUserDetailsService compositeUserDetailsService;
    private final UserLoginAuthService userLoginAuthService;
    private final AppUserAccountRepository appUserAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final StaffMemberService staffMemberService;
    private final StaffSessionService staffSessionService;

    @Transactional
    public void changePassword(Authentication authentication,
                               String currentPassword,
                               String newPassword,
                               String confirmPassword) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("You must be logged in to change your password.");
        }

        if (!StringUtils.hasText(currentPassword)
                || !StringUtils.hasText(newPassword)
                || !StringUtils.hasText(confirmPassword)) {
            throw new IllegalArgumentException("All password fields are required.");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        String username = authentication.getName();
        UserDetails userDetails = compositeUserDetailsService.loadUserByUsername(username);

        if (!passwordEncoder.matches(currentPassword, userDetails.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(newPassword, userDetails.getPassword())) {
            throw new IllegalArgumentException("New password must be different from your current password.");
        }

        AppUserAccount account = userLoginAuthService.findAccount(username)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        appUserAccountRepository.save(account);
    }

    @Transactional
    public void changeStaffPassword(Authentication authentication,
                                    Long staffId,
                                    String currentPassword,
                                    String newPassword,
                                    String confirmPassword) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("You must be logged in to change a password.");
        }
        if (staffId == null) {
            throw new IllegalArgumentException("Staff member not found.");
        }

        StaffMember staff = staffMemberService
                .getEntityById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found."));

        boolean superAdmin = staffSessionService.isSuperAdmin(authentication);
        boolean ownRecord = staffSessionService.resolveLinkedStaffMemberId(authentication)
                .map(staffId::equals)
                .orElse(false);

        if (!ownRecord && !superAdmin) {
            throw new IllegalArgumentException("You can only change your own password.");
        }

        if (!StringUtils.hasText(newPassword) || !StringUtils.hasText(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password are required.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        if (ownRecord && !superAdmin) {
            if (!StringUtils.hasText(currentPassword)) {
                throw new IllegalArgumentException("Current password is required.");
            }
            UserDetails userDetails = compositeUserDetailsService.loadUserByUsername(authentication.getName());
            if (!passwordEncoder.matches(currentPassword, userDetails.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect.");
            }
            if (passwordEncoder.matches(newPassword, userDetails.getPassword())) {
                throw new IllegalArgumentException("New password must be different from your current password.");
            }
        }

        AppUserAccount account = userLoginAuthService.ensureStaffAccount(staff);
        if (account.getPasswordHash() != null
                && !account.getPasswordHash().isBlank()
                && passwordEncoder.matches(newPassword, account.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from the current password.");
        }
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setLoginEnabled(!Boolean.TRUE.equals(staff.getDisabled()));
        account.setIsActive(!Boolean.TRUE.equals(staff.getDisabled()));
        appUserAccountRepository.save(account);
    }
}
