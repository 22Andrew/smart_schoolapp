package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppUserAccountService {

    private static final String TYPE_STUDENT = "STUDENT";
    private static final String TYPE_PARENT = "PARENT";
    private static final String TYPE_STAFF = "STAFF";

    private final AppUserAccountRepository appUserAccountRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final UserLoginAuthService userLoginAuthService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listByType(String type) {
        String normalized = normalizeType(type);
        syncAccounts(normalized);
        return switch (normalized) {
            case TYPE_PARENT -> listParents();
            case TYPE_STAFF -> listStaff();
            default -> listStudents();
        };
    }

    @Transactional
    public Map<String, Object> setLoginEnabled(Long id, boolean enabled) {
        AppUserAccount account = requireAccount(id);
        account.setLoginEnabled(enabled);
        account.setIsActive(enabled);
        return toAccountMap(appUserAccountRepository.save(account));
    }

    @Transactional
    public void syncAccounts(String type) {
        if (TYPE_STUDENT.equals(type) || type == null) {
            studentAdmissionRepository.search(null, null, null, false, null)
                    .forEach(this::ensureStudentAccount);
        }
        if (TYPE_PARENT.equals(type) || type == null) {
            studentAdmissionRepository.search(null, null, null, false, null)
                    .forEach(this::ensureParentAccount);
        }
        if (TYPE_STAFF.equals(type) || type == null) {
            staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                    .forEach(this::ensureStaffAccount);
        }
    }

    private List<Map<String, Object>> listStudents() {
        List<StudentAdmission> students = studentAdmissionRepository.search(null, null, null, false, null);
        if (students.isEmpty()) {
            return demoStudents();
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            AppUserAccount account = ensureStudentAccount(student);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", account.getId());
            row.put("sourceId", student.getId());
            row.put("admissionNo", student.getAdmissionNo());
            row.put("studentName", fullName(student.getFirstName(), student.getLastName()));
            row.put("username", account.getUsername());
            row.put("classLabel", classLabel(student));
            row.put("fatherName", blankTo(student.getFatherName(), "-"));
            row.put("mobileNumber", blankTo(student.getMobileNumber(), blankTo(student.getFatherPhone(), "-")));
            row.put("loginEnabled", Boolean.TRUE.equals(account.getLoginEnabled()));
            row.put("profileUrl", "/student/view/" + student.getId());
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> listParents() {
        List<StudentAdmission> students = studentAdmissionRepository.search(null, null, null, false, null);
        if (students.isEmpty()) {
            return demoParents();
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            AppUserAccount account = ensureParentAccount(student);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", account.getId());
            row.put("sourceId", student.getId());
            row.put("guardianName", guardianName(student));
            row.put("username", account.getUsername());
            row.put("mobileNumber", blankTo(student.getGuardianPhone(), blankTo(student.getFatherPhone(), "-")));
            row.put("studentName", fullName(student.getFirstName(), student.getLastName()));
            row.put("loginEnabled", Boolean.TRUE.equals(account.getLoginEnabled()));
            row.put("profileUrl", "/student/view/" + student.getId());
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> listStaff() {
        List<StaffMember> staffMembers = staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        if (staffMembers.isEmpty()) {
            return demoStaff();
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StaffMember staff : staffMembers) {
            AppUserAccount account = ensureStaffAccount(staff);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", account.getId());
            row.put("sourceId", staff.getId());
            row.put("staffId", staff.getStaffId());
            row.put("staffName", fullName(staff.getFirstName(), staff.getLastName()));
            row.put("username", account.getUsername());
            row.put("role", primaryRole(staff.getRoles()));
            row.put("mobileNumber", blankTo(staff.getPhone(), "-"));
            row.put("loginEnabled", Boolean.TRUE.equals(account.getLoginEnabled()));
            rows.add(row);
        }
        return rows;
    }

    private AppUserAccount ensureStudentAccount(StudentAdmission student) {
        return userLoginAuthService.ensureStudentAccount(student);
    }

    private AppUserAccount ensureParentAccount(StudentAdmission student) {
        return userLoginAuthService.ensureParentAccount(student);
    }

    private AppUserAccount ensureStaffAccount(StaffMember staff) {
        return appUserAccountRepository.findByUserTypeAndSourceId(TYPE_STAFF, staff.getId())
                .orElseGet(() -> appUserAccountRepository.save(AppUserAccount.builder()
                        .userType(TYPE_STAFF)
                        .sourceId(staff.getId())
                        .username(buildStaffUsername(staff))
                        .loginEnabled(true)
                        .build()));
    }

    private AppUserAccount requireAccount(Long id) {
        return appUserAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User account not found"));
    }

    private Map<String, Object> toAccountMap(AppUserAccount account) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", account.getId());
        map.put("username", account.getUsername());
        map.put("loginEnabled", Boolean.TRUE.equals(account.getLoginEnabled()));
        return map;
    }

    private String buildStudentUsername(StudentAdmission student) {
        String admissionNo = student.getAdmissionNo() == null ? "" : student.getAdmissionNo().replaceAll("\\D", "");
        if (!admissionNo.isBlank()) {
            return "std" + admissionNo;
        }
        return "std" + student.getId();
    }

    private String buildParentUsername(StudentAdmission student) {
        return "parent" + student.getId();
    }

    private String buildStaffUsername(StaffMember staff) {
        if (staff.getEmail() != null && staff.getEmail().contains("@")) {
            return staff.getEmail().substring(0, staff.getEmail().indexOf('@')).toLowerCase(Locale.ROOT);
        }
        return "staff" + staff.getId();
    }

    private String classLabel(StudentAdmission student) {
        String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "Class";
        String section = student.getSection() == null ? "" : student.getSection();
        return section.isBlank() ? className : className + "(" + section + ")";
    }

    private String guardianName(StudentAdmission student) {
        if (student.getGuardianName() != null && !student.getGuardianName().isBlank()) {
            return student.getGuardianName();
        }
        if (student.getFatherName() != null && !student.getFatherName().isBlank()) {
            return student.getFatherName();
        }
        return "-";
    }

    private String primaryRole(String roles) {
        if (roles == null || roles.isBlank()) {
            return "-";
        }
        String[] parts = roles.split(",");
        return parts[0].trim();
    }

    private String fullName(String firstName, String lastName) {
        return ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String normalizeType(String type) {
        if (type == null) {
            return TYPE_STUDENT;
        }
        return switch (type.trim().toLowerCase(Locale.ROOT)) {
            case "parent", "parents" -> TYPE_PARENT;
            case "staff" -> TYPE_STAFF;
            default -> TYPE_STUDENT;
        };
    }

    private List<Map<String, Object>> demoStudents() {
        return List.of(
                demoStudent(-1L, 1L, "110025", "Alhaji Mohamed Kanu", "std100", "Class 5(A)", "Alhaji Mohamed Kanu", "2323456789"),
                demoStudent(-2L, 2L, "18002", "John Doe", "std2", "Class 5(B)", "John Doe Sr", "2323456790"),
                demoStudent(-3L, 3L, "18001", "Jane Smith", "std3", "Class 5(A)", "Robert Smith", "2323456791"),
                demoStudent(-4L, 4L, "18003", "Michael Brown", "std4", "Class 5(C)", "David Brown", "2323456792")
        );
    }

    private Map<String, Object> demoStudent(Long accountId, Long sourceId, String admissionNo, String studentName,
                                            String username, String classLabel, String fatherName, String mobile) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", accountId);
        row.put("sourceId", sourceId);
        row.put("admissionNo", admissionNo);
        row.put("studentName", studentName);
        row.put("username", username);
        row.put("classLabel", classLabel);
        row.put("fatherName", fatherName);
        row.put("mobileNumber", mobile);
        row.put("loginEnabled", true);
        row.put("profileUrl", "#");
        row.put("demo", true);
        return row;
    }

    private List<Map<String, Object>> demoParents() {
        return List.of(
                demoParent(-11L, "Alhaji Mohamed Kanu", "parent100", "2323456789", "Alhaji Mohamed Kanu"),
                demoParent(-12L, "John Doe Sr", "parent2", "2323456790", "John Doe"),
                demoParent(-13L, "Robert Smith", "parent3", "2323456791", "Jane Smith")
        );
    }

    private Map<String, Object> demoParent(Long accountId, String guardianName, String username,
                                           String mobileNumber, String studentName) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", accountId);
        row.put("guardianName", guardianName);
        row.put("username", username);
        row.put("mobileNumber", mobileNumber);
        row.put("studentName", studentName);
        row.put("loginEnabled", true);
        row.put("profileUrl", "#");
        row.put("demo", true);
        return row;
    }

    private List<Map<String, Object>> demoStaff() {
        return List.of(
                demoStaff(-21L, "9001", "Alhaji Mohamed Kanu", "superadmin", "Super Admin", "2323456700"),
                demoStaff(-22L, "9002", "Teacher One", "teacher1", "Teacher", "2323456701"),
                demoStaff(-23L, "9003", "Accountant One", "accountant1", "Accountant", "2323456702")
        );
    }

    private Map<String, Object> demoStaff(Long accountId, String staffId, String staffName, String username,
                                          String role, String mobileNumber) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", accountId);
        row.put("staffId", staffId);
        row.put("staffName", staffName);
        row.put("username", username);
        row.put("role", role);
        row.put("mobileNumber", mobileNumber);
        row.put("loginEnabled", true);
        row.put("demo", true);
        return row;
    }
}
