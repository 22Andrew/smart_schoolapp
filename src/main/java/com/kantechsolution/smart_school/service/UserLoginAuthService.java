package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Order(25)
public class UserLoginAuthService implements ApplicationRunner {

    public static final String TYPE_STUDENT = "STUDENT";
    public static final String TYPE_PARENT = "PARENT";
    private static final String DEMO_STUDENT_USERNAME = "std1";
    private static final String DEMO_PARENT_USERNAME = "parent1";
    private static final String DEMO_PASSWORD = "110001";

    private final AppUserAccountRepository appUserAccountRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedDemoAccounts();
        reconcileDemoAccountLinks();
        backfillMissingPasswords();
        repairStoredPasswordHashes();
    }

    @Transactional(readOnly = true)
    public Optional<AppUserAccount> findEnabledAccount(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        return appUserAccountRepository.findByUsernameIgnoreCase(username.trim())
                .filter(account -> !Boolean.FALSE.equals(account.getLoginEnabled()))
                .filter(account -> TYPE_STUDENT.equals(account.getUserType()) || TYPE_PARENT.equals(account.getUserType()));
    }

    @Transactional
    public AppUserAccount ensureStudentAccount(StudentAdmission student) {
        AppUserAccount account = resolveStudentAccount(student);

        if (account.getPasswordHash() == null || account.getPasswordHash().isBlank()) {
            account.setPasswordHash(passwordEncoder.encode(defaultStudentPassword(student)));
        }
        account.setLoginEnabled(true);
        account.setIsActive(true);
        return appUserAccountRepository.save(account);
    }

    @Transactional
    public AppUserAccount ensureParentAccount(StudentAdmission student) {
        AppUserAccount account = resolveParentAccount(student);

        if (account.getPasswordHash() == null || account.getPasswordHash().isBlank()) {
            account.setPasswordHash(passwordEncoder.encode(defaultParentPassword(student)));
        }
        account.setLoginEnabled(true);
        account.setIsActive(true);
        return appUserAccountRepository.save(account);
    }

    private AppUserAccount resolveStudentAccount(StudentAdmission student) {
        Optional<AppUserAccount> linked = appUserAccountRepository.findByUserTypeAndSourceId(TYPE_STUDENT, student.getId());
        if (linked.isPresent()) {
            return linked.get();
        }

        String desiredUsername = buildStudentUsername(student);
        Optional<AppUserAccount> existingUsername = appUserAccountRepository.findByUsernameIgnoreCase(desiredUsername);
        if (existingUsername.isPresent()) {
            AppUserAccount account = existingUsername.get();
            if (TYPE_STUDENT.equals(account.getUserType())) {
                removeConflictingLinkedAccount(TYPE_STUDENT, student.getId(), account.getId());
                account.setSourceId(student.getId());
                return account;
            }
            return AppUserAccount.builder()
                    .userType(TYPE_STUDENT)
                    .sourceId(student.getId())
                    .username(desiredUsername + student.getId())
                    .loginEnabled(true)
                    .build();
        }

        return AppUserAccount.builder()
                .userType(TYPE_STUDENT)
                .sourceId(student.getId())
                .username(desiredUsername)
                .loginEnabled(true)
                .build();
    }

    private AppUserAccount resolveParentAccount(StudentAdmission student) {
        Optional<AppUserAccount> linked = appUserAccountRepository.findByUserTypeAndSourceId(TYPE_PARENT, student.getId());
        if (linked.isPresent()) {
            return linked.get();
        }

        String desiredUsername = buildParentUsername(student);
        Optional<AppUserAccount> existingUsername = appUserAccountRepository.findByUsernameIgnoreCase(desiredUsername);
        if (existingUsername.isPresent()) {
            AppUserAccount account = existingUsername.get();
            if (TYPE_PARENT.equals(account.getUserType())) {
                removeConflictingLinkedAccount(TYPE_PARENT, student.getId(), account.getId());
                account.setSourceId(student.getId());
                return account;
            }
            return AppUserAccount.builder()
                    .userType(TYPE_PARENT)
                    .sourceId(student.getId())
                    .username(desiredUsername + student.getId())
                    .loginEnabled(true)
                    .build();
        }

        return AppUserAccount.builder()
                .userType(TYPE_PARENT)
                .sourceId(student.getId())
                .username(desiredUsername)
                .loginEnabled(true)
                .build();
    }

    private void removeConflictingLinkedAccount(String userType, Long sourceId, Long keepAccountId) {
        appUserAccountRepository.findByUserTypeAndSourceId(userType, sourceId)
                .filter(account -> !Objects.equals(account.getId(), keepAccountId))
                .ifPresent(appUserAccountRepository::delete);
    }

    private void seedDemoAccounts() {
        ensureStandaloneAccount(DEMO_STUDENT_USERNAME, TYPE_STUDENT, DEMO_PASSWORD);
        ensureStandaloneAccount(DEMO_PARENT_USERNAME, TYPE_PARENT, DEMO_PASSWORD);
    }

    private void reconcileDemoAccountLinks() {
        studentAdmissionRepository.search(null, null, null, false, null).stream()
                .filter(student -> Long.valueOf(1L).equals(student.getId()))
                .findFirst()
                .ifPresent(student -> {
                    linkDemoAccountToStudent(DEMO_STUDENT_USERNAME, TYPE_STUDENT, student.getId());
                    linkDemoAccountToStudent(DEMO_PARENT_USERNAME, TYPE_PARENT, student.getId());
                });
    }

    private void linkDemoAccountToStudent(String demoUsername, String userType, Long sourceId) {
        Optional<AppUserAccount> demoAccount = appUserAccountRepository.findByUsernameIgnoreCase(demoUsername);
        if (demoAccount.isEmpty() || !userType.equals(demoAccount.get().getUserType())) {
            return;
        }

        removeConflictingLinkedAccount(userType, sourceId, demoAccount.get().getId());

        AppUserAccount account = demoAccount.get();
        account.setSourceId(sourceId);
        account.setLoginEnabled(true);
        account.setIsActive(true);
        account.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        appUserAccountRepository.save(account);
    }

    private void backfillMissingPasswords() {
        studentAdmissionRepository.search(null, null, null, false, null)
                .forEach(student -> {
                    ensureStudentAccount(student);
                    ensureParentAccount(student);
                });
    }

    private void repairStoredPasswordHashes() {
        appUserAccountRepository.findAll().stream()
                .filter(account -> TYPE_STUDENT.equals(account.getUserType()) || TYPE_PARENT.equals(account.getUserType()))
                .forEach(this::repairPasswordHashIfNeeded);
    }

    private void repairPasswordHashIfNeeded(AppUserAccount account) {
        String hash = account.getPasswordHash();
        if (hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"))) {
            return;
        }

        String rawPassword = resolveRawPasswordForAccount(account);
        account.setPasswordHash(passwordEncoder.encode(rawPassword));
        account.setLoginEnabled(true);
        account.setIsActive(true);
        appUserAccountRepository.save(account);
    }

    private String resolveRawPasswordForAccount(AppUserAccount account) {
        if (DEMO_STUDENT_USERNAME.equalsIgnoreCase(account.getUsername())
                || DEMO_PARENT_USERNAME.equalsIgnoreCase(account.getUsername())) {
            return DEMO_PASSWORD;
        }

        if (account.getSourceId() != null) {
            return studentAdmissionRepository.findById(account.getSourceId())
                    .map(student -> TYPE_PARENT.equals(account.getUserType())
                            ? defaultParentPassword(student)
                            : defaultStudentPassword(student))
                    .orElse(DEMO_PASSWORD);
        }

        return DEMO_PASSWORD;
    }

    private void ensureStandaloneAccount(String username, String userType, String rawPassword) {
        AppUserAccount account = appUserAccountRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> AppUserAccount.builder()
                        .userType(userType)
                        .username(username)
                        .loginEnabled(true)
                        .build());

        account.setUserType(userType);
        account.setLoginEnabled(true);
        account.setIsActive(true);
        account.setPasswordHash(passwordEncoder.encode(rawPassword));
        appUserAccountRepository.save(account);
    }

    private String buildStudentUsername(StudentAdmission student) {
        if (Long.valueOf(1L).equals(student.getId())) {
            return DEMO_STUDENT_USERNAME;
        }

        String admissionNo = student.getAdmissionNo() == null ? "" : student.getAdmissionNo().replaceAll("\\D", "");
        if (!admissionNo.isBlank()) {
            return "std" + admissionNo;
        }
        return "std" + student.getId();
    }

    private String buildParentUsername(StudentAdmission student) {
        if (Long.valueOf(1L).equals(student.getId())) {
            return DEMO_PARENT_USERNAME;
        }
        return "parent" + student.getId();
    }

    private String defaultStudentPassword(StudentAdmission student) {
        if (Long.valueOf(1L).equals(student.getId())) {
            return DEMO_PASSWORD;
        }
        if (student.getAdmissionNo() != null && !student.getAdmissionNo().isBlank()) {
            return student.getAdmissionNo().trim();
        }
        return DEMO_PASSWORD;
    }

    private String defaultParentPassword(StudentAdmission student) {
        if (Long.valueOf(1L).equals(student.getId())) {
            return DEMO_PASSWORD;
        }
        if (student.getAdmissionNo() != null && !student.getAdmissionNo().isBlank()) {
            return student.getAdmissionNo().trim();
        }
        return DEMO_PASSWORD;
    }

    public String roleAuthority(String userType) {
        return "ROLE_" + userType.toUpperCase(Locale.ROOT);
    }
}
