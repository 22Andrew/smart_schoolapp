package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.UserLog;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.UserLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserLogService implements ApplicationRunner {

    private static final DateTimeFormatter DISPLAY_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");

    private static final String CATEGORY_STAFF = "STAFF";
    private static final String CATEGORY_STUDENT = "STUDENT";
    private static final String CATEGORY_PARENT = "PARENT";
    private static final String CATEGORY_GUEST = "GUEST";

    private final UserLogRepository userLogRepository;
    private final AppUserAccountRepository appUserAccountRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (userLogRepository.count() == 0) {
            seedSampleLogs();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listLogs(String roleFilter) {
        List<UserLog> logs = resolveLogs(roleFilter);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (UserLog log : logs) {
            rows.add(toMap(log));
        }
        return rows;
    }

    @Transactional
    public void recordLogin(String username, HttpServletRequest request) {
        if (username == null || username.isBlank()) {
            return;
        }

        UserIdentity identity = resolveIdentity(username.trim());
        UserLog log = UserLog.builder()
                .username(username.trim())
                .role(identity.role())
                .userCategory(identity.category())
                .classLabel(blankToNull(identity.classLabel()))
                .ipAddress(resolveClientIp(request))
                .loginDateTime(LocalDateTime.now())
                .userAgent(formatUserAgent(request != null ? request.getHeader("User-Agent") : null))
                .build();
        userLogRepository.save(log);
    }

    @Transactional
    public void clearAll() {
        userLogRepository.deleteAll();
    }

    private List<UserLog> resolveLogs(String roleFilter) {
        String normalized = normalizeFilter(roleFilter);
        if (normalized == null) {
            return userLogRepository.findAllByOrderByLoginDateTimeDesc();
        }
        return userLogRepository.findByUserCategoryOrderByLoginDateTimeDesc(normalized);
    }

    private Map<String, Object> toMap(UserLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("username", log.getUsername());
        row.put("role", log.getRole());
        row.put("classLabel", blankTo(log.getClassLabel(), ""));
        row.put("ipAddress", blankTo(log.getIpAddress(), ""));
        row.put("loginDateTime", log.getLoginDateTime() != null
                ? log.getLoginDateTime().format(DISPLAY_FMT) : "");
        row.put("userAgent", blankTo(log.getUserAgent(), ""));
        return row;
    }

    private UserIdentity resolveIdentity(String username) {
        Optional<AppUserAccount> accountOpt = appUserAccountRepository.findAll().stream()
                .filter(account -> username.equalsIgnoreCase(account.getUsername()))
                .findFirst();

        if (accountOpt.isPresent()) {
            AppUserAccount account = accountOpt.get();
            return switch (blankTo(account.getUserType(), "").toUpperCase(Locale.ROOT)) {
                case "STUDENT" -> new UserIdentity(
                        CATEGORY_STUDENT,
                        "Student",
                        resolveStudentClass(account.getSourceId()));
                case "PARENT" -> new UserIdentity(CATEGORY_PARENT, "Parent", null);
                case "STAFF" -> new UserIdentity(
                        CATEGORY_STAFF,
                        resolveStaffRole(account.getSourceId()),
                        null);
                default -> new UserIdentity(CATEGORY_GUEST, "Guest", null);
            };
        }

        return resolveSecurityIdentity(username);
    }

    private UserIdentity resolveSecurityIdentity(String username) {
        String lower = username.toLowerCase(Locale.ROOT);
        if (lower.contains("guest") || lower.startsWith("guest")) {
            return new UserIdentity(CATEGORY_GUEST, "Guest", null);
        }
        if (lower.startsWith("std")) {
            return new UserIdentity(CATEGORY_STUDENT, "Student", null);
        }
        if (lower.startsWith("parent")) {
            return new UserIdentity(CATEGORY_PARENT, "Parent", null);
        }

        return switch (lower) {
            case "superadmin@gmail.com" -> new UserIdentity(CATEGORY_STAFF, "Super Admin", null);
            case "admin@gmail.com" -> new UserIdentity(CATEGORY_STAFF, "Admin", null);
            case "teacher@gmail.com" -> new UserIdentity(CATEGORY_STAFF, "Teacher", null);
            case "accountant@gmail.com" -> new UserIdentity(CATEGORY_STAFF, "Accountant", null);
            case "receptionist@gmail.com" -> new UserIdentity(CATEGORY_STAFF, "Receptionist", null);
            case "librarian@gmail.com" -> new UserIdentity(CATEGORY_STAFF, "Librarian", null);
            default -> lower.contains("@")
                    ? new UserIdentity(CATEGORY_GUEST, "Guest", null)
                    : new UserIdentity(CATEGORY_STAFF, "Staff", null);
        };
    }

    private String resolveStudentClass(Long sourceId) {
        if (sourceId == null) {
            return null;
        }
        return studentAdmissionRepository.findById(sourceId)
                .map(this::classLabel)
                .orElse(null);
    }

    private String resolveStaffRole(Long sourceId) {
        if (sourceId == null) {
            return "Staff";
        }
        return staffMemberRepository.findById(sourceId)
                .map(this::primaryRole)
                .orElse("Staff");
    }

    private String classLabel(StudentAdmission student) {
        String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "Class";
        String section = student.getSection() == null ? "" : student.getSection();
        return section.isBlank() ? className : className + "(" + section + ")";
    }

    private String primaryRole(StaffMember staff) {
        if (staff.getRoles() == null || staff.getRoles().isBlank()) {
            return "Staff";
        }
        return staff.getRoles().split(",")[0].trim();
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "" : request.getRemoteAddr();
    }

    String formatUserAgent(String rawAgent) {
        if (rawAgent == null || rawAgent.isBlank()) {
            return "-";
        }

        String browser = "Unknown Browser";
        Matcher chrome = Pattern.compile("Chrome/([\\d.]+)", Pattern.CASE_INSENSITIVE).matcher(rawAgent);
        Matcher firefox = Pattern.compile("Firefox/([\\d.]+)", Pattern.CASE_INSENSITIVE).matcher(rawAgent);
        Matcher edge = Pattern.compile("Edg/([\\d.]+)", Pattern.CASE_INSENSITIVE).matcher(rawAgent);
        Matcher safari = Pattern.compile("Version/([\\d.]+).*Safari", Pattern.CASE_INSENSITIVE).matcher(rawAgent);

        if (edge.find()) {
            browser = "Edge " + edge.group(1);
        } else if (chrome.find()) {
            browser = "Chrome " + chrome.group(1);
        } else if (firefox.find()) {
            browser = "Firefox " + firefox.group(1);
        } else if (safari.find()) {
            browser = "Safari " + safari.group(1);
        }

        String os = "Unknown OS";
        if (rawAgent.contains("Windows NT 10.0")) {
            os = "Windows 10";
        } else if (rawAgent.contains("Windows NT 11.0")) {
            os = "Windows 11";
        } else if (rawAgent.contains("Windows")) {
            os = "Windows";
        } else if (rawAgent.contains("Android")) {
            os = "Android";
        } else if (rawAgent.contains("iPhone") || rawAgent.contains("iPad")) {
            os = "iOS";
        } else if (rawAgent.contains("Mac OS X")) {
            os = "macOS";
        } else if (rawAgent.contains("Linux")) {
            os = "Linux";
        }

        return browser + ", " + os;
    }

    private String normalizeFilter(String roleFilter) {
        if (roleFilter == null || roleFilter.isBlank() || "all".equalsIgnoreCase(roleFilter.trim())) {
            return null;
        }
        return switch (roleFilter.trim().toLowerCase(Locale.ROOT)) {
            case "staff" -> CATEGORY_STAFF;
            case "student", "students" -> CATEGORY_STUDENT;
            case "parent" -> CATEGORY_PARENT;
            case "guest" -> CATEGORY_GUEST;
            default -> null;
        };
    }

    private void seedSampleLogs() {
        LocalDateTime now = LocalDateTime.now();
        Object[][] samples = {
                {"superadmin@gmail.com", "Super Admin", CATEGORY_STAFF, null,
                        "187.40.231.102", now.minusHours(2), "Chrome 150.0.0.0, Windows 10"},
                {"std1", "Student", CATEGORY_STUDENT, "Class 1(A)",
                        "192.168.0.153", now.minusHours(3), "Chrome 81.0.4044.138, Android"},
                {"vfig34@gmail.com", "Guest", CATEGORY_GUEST, null,
                        "192.168.0.153", now.minusHours(4), "Chrome 81.0.4044.138, Android"},
                {"admin@gmail.com", "Admin", CATEGORY_STAFF, null,
                        "192.168.0.101", now.minusHours(5), "Chrome 120.0.0.0, Windows 10"},
                {"teacher@gmail.com", "Teacher", CATEGORY_STAFF, null,
                        "192.168.0.102", now.minusHours(6), "Firefox 115.0.0.0, Windows 10"},
                {"parent1", "Parent", CATEGORY_PARENT, null,
                        "192.168.0.120", now.minusHours(7), "Chrome 119.0.0.0, Android"}
        };

        for (Object[] sample : samples) {
            UserLog log = UserLog.builder()
                    .username(String.valueOf(sample[0]))
                    .role(String.valueOf(sample[1]))
                    .userCategory(String.valueOf(sample[2]))
                    .classLabel(sample[3] == null ? null : String.valueOf(sample[3]))
                    .ipAddress(String.valueOf(sample[4]))
                    .loginDateTime((LocalDateTime) sample[5])
                    .userAgent(String.valueOf(sample[6]))
                    .build();
            userLogRepository.save(log);
        }

        appUserAccountRepository.findAll().stream()
                .limit(5)
                .forEach(account -> {
                    UserIdentity identity = resolveIdentity(account.getUsername());
                    UserLog log = UserLog.builder()
                            .username(account.getUsername())
                            .role(identity.role())
                            .userCategory(identity.category())
                            .classLabel(blankToNull(identity.classLabel()))
                            .ipAddress("192.168.0." + (100 + account.getId().intValue() % 50))
                            .loginDateTime(now.minusDays(1).minusHours(account.getId() % 8))
                            .userAgent("Chrome 120.0.0.0, Windows 10")
                            .build();
                    userLogRepository.save(log);
                });
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private record UserIdentity(String category, String role, String classLabel) {
    }
}
