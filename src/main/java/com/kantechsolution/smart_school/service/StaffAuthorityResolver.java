package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StaffAuthorityResolver {

    private static final Map<String, String> DEMO_LOGIN_ROLES = Map.of(
            "superadmin@gmail.com", "SUPER_ADMIN",
            "admin@gmail.com", "ADMIN",
            "teacher@gmail.com", "TEACHER",
            "accountant@gmail.com", "ACCOUNTANT",
            "receptionist@gmail.com", "RECEPTIONIST",
            "librarian@gmail.com", "LIBRARIAN"
    );

    private static final List<String> ROLE_PRIORITY = List.of(
            "SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "RECEPTIONIST"
    );

    private final StaffMemberRepository staffMemberRepository;

    public List<SimpleGrantedAuthority> resolve(AppUserAccount account) {
        if (account == null || account.getUsername() == null) {
            return List.of(new SimpleGrantedAuthority("ROLE_STAFF"));
        }

        String username = account.getUsername().trim().toLowerCase(Locale.ROOT);
        String demoRole = DEMO_LOGIN_ROLES.get(username);
        if (demoRole != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + demoRole));
        }

        if (account.getSourceId() != null) {
            return staffMemberRepository.findById(account.getSourceId())
                    .map(this::fromStaffMember)
                    .orElse(List.of(new SimpleGrantedAuthority("ROLE_STAFF")));
        }

        return staffMemberRepository.findByEmailIgnoreCase(username)
                .map(this::fromStaffMember)
                .orElse(List.of(new SimpleGrantedAuthority("ROLE_STAFF")));
    }

    private List<SimpleGrantedAuthority> fromStaffMember(StaffMember staff) {
        Set<String> mapped = new LinkedHashSet<>();
        if (staff.getRoles() != null) {
            for (String part : staff.getRoles().split(",")) {
                String authority = mapRoleLabel(part);
                if (authority != null) {
                    mapped.add(authority);
                }
            }
        }

        if (mapped.isEmpty()) {
            return List.of(new SimpleGrantedAuthority("ROLE_STAFF"));
        }

        for (String priority : ROLE_PRIORITY) {
            if (mapped.contains(priority)) {
                return List.of(new SimpleGrantedAuthority("ROLE_" + priority));
            }
        }

        String first = mapped.iterator().next();
        return List.of(new SimpleGrantedAuthority("ROLE_" + first));
    }

    private String mapRoleLabel(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }
        return switch (label.trim().toLowerCase(Locale.ROOT)) {
            case "super admin" -> "SUPER_ADMIN";
            case "admin", "principal" -> "ADMIN";
            case "teacher", "faculty", "technical head" -> "TEACHER";
            case "accountant" -> "ACCOUNTANT";
            case "librarian" -> "LIBRARIAN";
            case "receptionist" -> "RECEPTIONIST";
            default -> label.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        };
    }
}
