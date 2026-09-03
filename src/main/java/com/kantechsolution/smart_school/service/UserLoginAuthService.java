package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Order(25)
public class UserLoginAuthService implements ApplicationRunner {

    public static final String TYPE_STUDENT = "STUDENT";
    public static final String TYPE_PARENT = "PARENT";
    public static final String TYPE_STAFF = "STAFF";
    private static final String DEMO_STUDENT_USERNAME = "std1";
    private static final String DEMO_PARENT_USERNAME = "parent1";
    private static final String DEMO_PASSWORD = "110001";

    private static final Map<String, String> DEMO_STAFF_LOGIN_IDS = Map.of(
            "superadmin@gmail.com", "9000",
            "admin@gmail.com", "9001",
            "teacher@gmail.com", "9002",
            "accountant@gmail.com", "9005",
            "receptionist@gmail.com", "9006",
            "librarian@gmail.com", "9004"
    );

    private static final Map<String, String> DEMO_STAFF_LOGIN_PASSWORDS = Map.of(
            "superadmin@gmail.com", "Superadmin1",
            "admin@gmail.com", "Admin123",
            "teacher@gmail.com", "Teacher123",
            "accountant@gmail.com", "Accountant123",
            "receptionist@gmail.com", "Receptionist123",
            "librarian@gmail.com", "Librarian123"
    );

    private final AppUserAccountRepository appUserAccountRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final StaffAuthorityResolver staffAuthorityResolver;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedDemoAccounts();
        reconcileDemoAccountLinks();
        backfillMissingPasswords();
        repairStoredPasswordHashes();
        seedDemoStaffAccounts();
        backfillStaffAccounts();
    }

    @Transactional(readOnly = true)
    public Optional<AppUserAccount> findAccount(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        return appUserAccountRepository.findByUsernameIgnoreCase(username.trim())
                .filter(account -> !Boolean.FALSE.equals(account.getLoginEnabled()));
    }

    @Transactional(readOnly = true)
    public Optional<AppUserAccount> findEnabledAccount(String username) {
        return findAccount(username)
                .filter(account -> TYPE_STUDENT.equals(account.getUserType()) || TYPE_PARENT.equals(account.getUserType()));
    }

    @Transactional(readOnly = true)
    public UserDetails toUserDetails(AppUserAccount account) {
        if (TYPE_STAFF.equals(account.getUserType())) {
            return User.builder()
                    .username(account.getUsername())
                    .password(account.getPasswordHash())
                    .authorities(staffAuthorityResolver.resolve(account))
                    .disabled(Boolean.FALSE.equals(account.getLoginEnabled()))
                    .build();
        }

        return User.builder()
                .username(account.getUsername())
                .password(account.getPasswordHash())
                .authorities(java.util.List.of(new SimpleGrantedAuthority(roleAuthority(account.getUserType()))))
                .disabled(Boolean.FALSE.equals(account.getLoginEnabled()))
                .build();
    }

    @Transactional
    public AppUserAccount ensureStaffAccount(StaffMember staff) {
        Optional<AppUserAccount> linked = appUserAccountRepository.findByUserTypeAndSourceId(TYPE_STAFF, staff.getId());
        if (linked.isPresent()) {
            AppUserAccount account = linked.get();
            syncStaffAccountState(account, staff);
            return appUserAccountRepository.save(account);
        }

        String username = resolveStaffUsername(staff);
        Optional<AppUserAccount> existingUsername = appUserAccountRepository.findByUsernameIgnoreCase(username);
        if (existingUsername.isPresent()) {
            AppUserAccount account = existingUsername.get();
            removeConflictingLinkedAccount(TYPE_STAFF, staff.getId(), account.getId());
            account.setUserType(TYPE_STAFF);
            account.setSourceId(staff.getId());
            account.setUsername(username);
            syncStaffAccountState(account, staff);
            return appUserAccountRepository.save(account);
        }

        AppUserAccount account = AppUserAccount.builder()
                .userType(TYPE_STAFF)
                .sourceId(staff.getId())
                .username(username)
                .loginEnabled(!Boolean.TRUE.equals(staff.getDisabled()))
                .build();
        syncStaffAccountState(account, staff);
        return appUserAccountRepository.save(account);
    }

    @Transactional
    public void setStaffLoginEnabled(Long staffId, boolean enabled) {
        appUserAccountRepository.findByUserTypeAndSourceId(TYPE_STAFF, staffId).ifPresent(account -> {
            account.setLoginEnabled(enabled);
            account.setIsActive(enabled);
            appUserAccountRepository.save(account);
        });
    }

    @Transactional
    public void deleteStaffAccount(Long staffId) {
        appUserAccountRepository.findByUserTypeAndSourceId(TYPE_STAFF, staffId)
                .ifPresent(appUserAccountRepository::delete);
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
        try {
            studentAdmissionRepository.search(null, null, null, false, null).stream()
                    .filter(student -> Long.valueOf(1L).equals(student.getId()))
                    .findFirst()
                    .ifPresent(student -> {
                        linkDemoAccountToStudent(DEMO_STUDENT_USERNAME, TYPE_STUDENT, student.getId());
                        linkDemoAccountToStudent(DEMO_PARENT_USERNAME, TYPE_PARENT, student.getId());
                    });
        } catch (DataAccessException ignored) {
            // Skip when student_admissions is not available yet.
        }
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
        try {
            studentAdmissionRepository.search(null, null, null, false, null)
                    .forEach(student -> {
                        ensureStudentAccount(student);
                        ensureParentAccount(student);
                    });
        } catch (DataAccessException ignored) {
            // Skip when student_admissions is not available yet.
        }
    }

    private void repairStoredPasswordHashes() {
        appUserAccountRepository.findAll().forEach(this::repairPasswordHashIfNeeded);
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
        if (TYPE_STAFF.equals(account.getUserType())) {
            return resolveRawPasswordForStaffAccount(account);
        }

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

    private void seedDemoStaffAccounts() {
        try {
            DEMO_STAFF_LOGIN_IDS.forEach((loginEmail, staffId) ->
                    staffMemberRepository.findByStaffId(staffId).ifPresent(staff -> {
                        AppUserAccount account = appUserAccountRepository.findByUsernameIgnoreCase(loginEmail)
                                .orElseGet(() -> AppUserAccount.builder()
                                        .username(loginEmail)
                                        .userType(TYPE_STAFF)
                                        .build());
                        account.setUserType(TYPE_STAFF);
                        account.setSourceId(staff.getId());
                        account.setUsername(loginEmail);
                        account.setPasswordHash(passwordEncoder.encode(
                                DEMO_STAFF_LOGIN_PASSWORDS.getOrDefault(loginEmail, DEMO_PASSWORD)));
                        account.setLoginEnabled(!Boolean.TRUE.equals(staff.getDisabled()));
                        account.setIsActive(!Boolean.TRUE.equals(staff.getDisabled()));
                        appUserAccountRepository.save(account);
                    }));
        } catch (DataAccessException ignored) {
            // Skip when staff_members is not available yet.
        }
    }

    private void backfillStaffAccounts() {
        try {
            staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                    .forEach(this::ensureStaffAccount);
        } catch (DataAccessException ignored) {
            // Skip when staff_members is not available yet.
        }
    }

    private void syncStaffAccountState(AppUserAccount account, StaffMember staff) {
        if (account.getPasswordHash() == null || account.getPasswordHash().isBlank()) {
            account.setPasswordHash(passwordEncoder.encode(defaultStaffPassword(staff, account.getUsername())));
        }
        boolean enabled = !Boolean.TRUE.equals(staff.getDisabled());
        account.setLoginEnabled(enabled);
        account.setIsActive(enabled);
    }

    private String resolveStaffUsername(StaffMember staff) {
        return demoLoginEmailForStaffId(staff.getStaffId())
                .orElseGet(() -> staff.getEmail().trim().toLowerCase(Locale.ROOT));
    }

    private Optional<String> demoLoginEmailForStaffId(String staffId) {
        if (staffId == null || staffId.isBlank()) {
            return Optional.empty();
        }
        return DEMO_STAFF_LOGIN_IDS.entrySet().stream()
                .filter(entry -> staffId.equals(entry.getValue()))
                .map(Map.Entry::getKey)
                .findFirst();
    }

    private String defaultStaffPassword(StaffMember staff, String username) {
        String demoPassword = DEMO_STAFF_LOGIN_PASSWORDS.get(username == null ? "" : username.toLowerCase(Locale.ROOT));
        if (demoPassword != null) {
            return demoPassword;
        }
        if (staff.getStaffId() != null && !staff.getStaffId().isBlank()) {
            return staff.getStaffId().trim();
        }
        return DEMO_PASSWORD;
    }

    private String resolveRawPasswordForStaffAccount(AppUserAccount account) {
        String demoPassword = DEMO_STAFF_LOGIN_PASSWORDS.get(account.getUsername().toLowerCase(Locale.ROOT));
        if (demoPassword != null) {
            return demoPassword;
        }
        if (account.getSourceId() != null) {
            return staffMemberRepository.findById(account.getSourceId())
                    .map(staff -> defaultStaffPassword(staff, account.getUsername()))
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

    @Transactional
    public String resolvePlainPassword(AppUserAccount account) {
        if (TYPE_STAFF.equals(account.getUserType())) {
            String hash = account.getPasswordHash();
            if (hash == null || hash.isBlank() || !(hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"))) {
                account.setPasswordHash(passwordEncoder.encode(resolveRawPasswordForStaffAccount(account)));
                appUserAccountRepository.save(account);
            }
            return resolveRawPasswordForStaffAccount(account);
        }
        repairPasswordHashIfNeeded(account);
        return resolveRawPasswordForAccount(account);
    }
}
