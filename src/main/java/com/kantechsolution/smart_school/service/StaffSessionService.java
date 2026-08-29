package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StaffSessionUser;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class StaffSessionService {

    private static final Map<String, String> DEMO_DISPLAY_NAMES = Map.of(
            "superadmin@gmail.com", "Super Admin",
            "admin@gmail.com", "Admin User",
            "teacher@gmail.com", "Teacher User",
            "accountant@gmail.com", "Accountant User",
            "receptionist@gmail.com", "Receptionist User",
            "librarian@gmail.com", "Librarian User"
    );

    /** Maps demo login emails to seeded staff IDs in StaffMemberService. */
    private static final Map<String, String> DEMO_LOGIN_STAFF_IDS = Map.of(
            "superadmin@gmail.com", "9000",
            "admin@gmail.com", "9001",
            "teacher@gmail.com", "9002",
            "accountant@gmail.com", "9005",
            "receptionist@gmail.com", "9006",
            "librarian@gmail.com", "9004"
    );

    private final RoleSidebarMenuService roleSidebarMenuService;
    private final StaffMemberRepository staffMemberRepository;

    public StaffSessionService(RoleSidebarMenuService roleSidebarMenuService,
                               StaffMemberRepository staffMemberRepository) {
        this.roleSidebarMenuService = roleSidebarMenuService;
        this.staffMemberRepository = staffMemberRepository;
    }

    public StaffSessionUser resolve(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return new StaffSessionUser("Staff User", "", "");
        }

        String email = authentication.getName() == null ? "" : authentication.getName().trim();
        String role = roleSidebarMenuService.resolveRoleLabel(authentication);
        String name = resolveDisplayName(email, role);
        return new StaffSessionUser(name, role, email);
    }

    public boolean isStaffPanelUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(this::isStaffAuthority);
    }

    public boolean usesRoleBasedSidebar(Authentication authentication) {
        return roleSidebarMenuService.isTeacher(authentication)
                || roleSidebarMenuService.isAccountant(authentication)
                || roleSidebarMenuService.isReceptionist(authentication);
    }

    public String resolveDashboardUrl(Authentication authentication) {
        if (isStaffPanelUser(authentication)) {
            return "/admin/admin/dashboard";
        }
        return "/dashboard";
    }

    /**
     * Resolves the staff directory record linked to the logged-in demo account.
     */
    public Optional<Long> resolveLinkedStaffMemberId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String email = authentication.getName() == null ? "" : authentication.getName().trim().toLowerCase(Locale.ROOT);

        Optional<Long> byLoginEmail = staffMemberRepository.findByEmail(email).map(StaffMember::getId);
        if (byLoginEmail.isPresent()) {
            return byLoginEmail;
        }

        String staffId = DEMO_LOGIN_STAFF_IDS.get(email);
        if (staffId != null) {
            Optional<Long> mapped = staffMemberRepository.findByStaffId(staffId).map(StaffMember::getId);
            if (mapped.isPresent()) {
                return mapped;
            }
        }

        if (roleSidebarMenuService.isReceptionist(authentication)) {
            return staffMemberRepository.findByEmail("receptionist@gmail.com").map(StaffMember::getId)
                    .or(() -> staffMemberRepository.findByStaffId("9006").map(StaffMember::getId))
                    .or(() -> staffMemberRepository.search("Receptionist", null).stream()
                            .filter(member -> "Receptionist".equalsIgnoreCase(member.getFirstName())
                                    && "User".equalsIgnoreCase(member.getLastName()))
                            .findFirst()
                            .map(StaffMember::getId))
                    .or(() -> staffMemberRepository.search("Receptionist", null).stream()
                            .findFirst()
                            .map(StaffMember::getId));
        }

        return Optional.empty();
    }

    public boolean isReceptionistStaffDirectoryRestricted(Authentication authentication) {
        if (roleSidebarMenuService.isReceptionist(authentication)) {
            return true;
        }
        if (authentication == null || authentication.getName() == null) {
            return false;
        }
        String username = authentication.getName().trim().toLowerCase(Locale.ROOT);
        if ("receptionist@gmail.com".equals(username)) {
            return true;
        }
        return "Receptionist".equalsIgnoreCase(roleSidebarMenuService.resolveRoleLabel(authentication));
    }

    public void applyDirectoryPermissions(List<Map<String, Object>> staff, Authentication authentication) {
        if (staff == null || staff.isEmpty()) {
            return;
        }

        boolean restricted = isReceptionistStaffDirectoryRestricted(authentication);
        Optional<Long> ownId = restricted ? resolveLinkedStaffMemberId(authentication) : Optional.empty();
        if (restricted && ownId.isEmpty()) {
            ownId = resolveFallbackReceptionistStaffId();
        }
        String loginEmail = authentication != null && authentication.getName() != null
                ? authentication.getName().trim().toLowerCase(Locale.ROOT)
                : "";

        for (int i = 0; i < staff.size(); i++) {
            Map<String, Object> row = new LinkedHashMap<>(staff.get(i));
            if (restricted) {
                boolean isOwn = matchesOwnStaffRecord(row, ownId, loginEmail);
                row.put("canView", isOwn);
                row.put("canEdit", false);
            } else {
                row.put("canView", true);
                row.put("canEdit", true);
            }
            staff.set(i, row);
        }
    }

    private Optional<Long> resolveFallbackReceptionistStaffId() {
        List<StaffMember> receptionists = staffMemberRepository.search("Receptionist", null);
        if (receptionists.isEmpty()) {
            return Optional.empty();
        }
        if (receptionists.size() == 1) {
            return Optional.of(receptionists.get(0).getId());
        }
        return receptionists.stream()
                .filter(member -> "Receptionist User".equalsIgnoreCase(
                        (member.getFirstName() + " " + (member.getLastName() == null ? "" : member.getLastName())).trim()))
                .findFirst()
                .map(StaffMember::getId)
                .or(() -> receptionists.stream().findFirst().map(StaffMember::getId));
    }

    private boolean matchesOwnStaffRecord(Map<String, Object> row, Optional<Long> ownId, String loginEmail) {
        if (ownId.isPresent()) {
            Long rowId = toLong(row.get("id"));
            if (rowId != null && ownId.get().equals(rowId)) {
                return true;
            }
        }

        Object email = row.get("email");
        if (email != null && !loginEmail.isBlank()
                && loginEmail.equals(String.valueOf(email).trim().toLowerCase(Locale.ROOT))) {
            return true;
        }

        Object staffId = row.get("staffId");
        if ("9006".equals(String.valueOf(staffId))) {
            return true;
        }

        Object fullName = row.get("fullName");
        if (fullName != null && "Receptionist User".equalsIgnoreCase(String.valueOf(fullName).trim())) {
            return true;
        }

        Object role = row.get("role");
        Object roles = row.get("roles");
        boolean receptionistRole = (role != null && "Receptionist".equalsIgnoreCase(String.valueOf(role).trim()))
                || (roles instanceof Iterable<?> iterable && containsReceptionistRole(iterable));
        return receptionistRole && fullName != null
                && String.valueOf(fullName).toLowerCase(Locale.ROOT).contains("receptionist");
    }

    private boolean containsReceptionistRole(Iterable<?> roles) {
        for (Object value : roles) {
            if (value != null && "Receptionist".equalsIgnoreCase(String.valueOf(value).trim())) {
                return true;
            }
        }
        return false;
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isStaffAuthority(String authority) {
        if (authority == null) {
            return false;
        }
        return authority.startsWith("ROLE_")
                && !authority.equals("ROLE_STUDENT")
                && !authority.equals("ROLE_PARENT");
    }

    private String resolveDisplayName(String email, String role) {
        String mapped = DEMO_DISPLAY_NAMES.get(email.toLowerCase(Locale.ROOT));
        if (mapped != null) {
            return mapped;
        }
        if (!role.isBlank()) {
            return role;
        }
        int at = email.indexOf('@');
        if (at > 0) {
            return capitalize(email.substring(0, at));
        }
        return "Staff User";
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "Staff User";
        }
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
    }
}
