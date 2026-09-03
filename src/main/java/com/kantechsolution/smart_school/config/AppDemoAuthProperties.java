package com.kantechsolution.smart_school.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Locale;
import java.util.Map;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.demo")
public class AppDemoAuthProperties {

    private String studentPassword = "110001";
    private String parentPassword = "110001";
    private Staff staff = new Staff();

    @Getter
    @Setter
    public static class Staff {
        private String superadminPassword = "Superadmin1";
        private String adminPassword = "Admin123";
        private String teacherPassword = "Teacher123";
        private String accountantPassword = "Accountant123";
        private String receptionistPassword = "Receptionist123";
        private String librarianPassword = "Librarian123";
    }

    private static final Map<String, String> STAFF_EMAILS = Map.of(
            "superadmin@gmail.com", "9000",
            "admin@gmail.com", "9001",
            "teacher@gmail.com", "9002",
            "accountant@gmail.com", "9005",
            "receptionist@gmail.com", "9006",
            "librarian@gmail.com", "9004"
    );

    public Map<String, String> staffLoginIds() {
        return STAFF_EMAILS;
    }

    public String staffPasswordFor(String loginEmail) {
        if (loginEmail == null || loginEmail.isBlank()) {
            return studentPassword;
        }
        return switch (loginEmail.trim().toLowerCase(Locale.ROOT)) {
            case "superadmin@gmail.com" -> staff.getSuperadminPassword();
            case "admin@gmail.com" -> staff.getAdminPassword();
            case "teacher@gmail.com" -> staff.getTeacherPassword();
            case "accountant@gmail.com" -> staff.getAccountantPassword();
            case "receptionist@gmail.com" -> staff.getReceptionistPassword();
            case "librarian@gmail.com" -> staff.getLibrarianPassword();
            default -> studentPassword;
        };
    }
}
