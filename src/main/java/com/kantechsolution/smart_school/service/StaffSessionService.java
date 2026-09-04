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

    private record StaffDirectoryRoleProfile(
            String loginEmail,
            String demoStaffId,
            String preferredFullName,
            String searchRole
    ) {
    }

    private static final Map<String, StaffDirectoryRoleProfile> STAFF_DIRECTORY_ROLE_PROFILES = Map.of(
            "Receptionist", new StaffDirectoryRoleProfile(
                    "receptionist@gmail.com", "9006", "Receptionist User", "Receptionist"),
            "Librarian", new StaffDirectoryRoleProfile(
                    "librarian@gmail.com", "9004", "Librarian User", "Librarian"),
            "Teacher", new StaffDirectoryRoleProfile(
                    "teacher@gmail.com", "9002", null, "Teacher"),
            "Accountant", new StaffDirectoryRoleProfile(
                    "accountant@gmail.com", "9005", null, "Accountant")
    );

    private static final List<String> STAFF_DIRECTORY_RESTRICTED_ROLES = List.of(
            "Receptionist", "Librarian", "Teacher", "Accountant"
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
                || roleSidebarMenuService.isReceptionist(authentication)
                || roleSidebarMenuService.isLibrarian(authentication);
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

        return resolveStaffDirectoryRestrictedRole(authentication)
                .flatMap(this::resolveFallbackStaffIdForRole);
    }

    public Optional<String> resolveStaffDirectoryRestrictedRole(Authentication authentication) {
        for (String role : STAFF_DIRECTORY_RESTRICTED_ROLES) {
            if (isStaffDirectoryRestrictedForRole(authentication, role)) {
                return Optional.of(role);
            }
        }
        return Optional.empty();
    }

    public boolean isStaffDirectoryRestricted(Authentication authentication) {
        return resolveStaffDirectoryRestrictedRole(authentication).isPresent();
    }

    public boolean isReceptionistStaffDirectoryRestricted(Authentication authentication) {
        return isStaffDirectoryRestrictedForRole(authentication, "Receptionist");
    }

    public boolean isLibrarianStaffDirectoryRestricted(Authentication authentication) {
        return isStaffDirectoryRestrictedForRole(authentication, "Librarian");
    }

    public boolean isTeacherStaffDirectoryRestricted(Authentication authentication) {
        return isStaffDirectoryRestrictedForRole(authentication, "Teacher");
    }

    public boolean isAccountantStaffDirectoryRestricted(Authentication authentication) {
        return isStaffDirectoryRestrictedForRole(authentication, "Accountant");
    }

    private boolean isStaffDirectoryRestrictedForRole(Authentication authentication, String roleLabel) {
        StaffDirectoryRoleProfile profile = STAFF_DIRECTORY_ROLE_PROFILES.get(roleLabel);
        if (profile == null) {
            return false;
        }
        if (matchesRoleAuthority(authentication, roleLabel)) {
            return true;
        }
        if (authentication == null || authentication.getName() == null) {
            return false;
        }
        String username = authentication.getName().trim().toLowerCase(Locale.ROOT);
        if (profile.loginEmail().equals(username)) {
            return true;
        }
        return roleLabel.equalsIgnoreCase(roleSidebarMenuService.resolveRoleLabel(authentication));
    }

    private boolean matchesRoleAuthority(Authentication authentication, String roleLabel) {
        if (authentication == null) {
            return false;
        }
        return switch (roleLabel) {
            case "Receptionist" -> roleSidebarMenuService.isReceptionist(authentication);
            case "Librarian" -> roleSidebarMenuService.isLibrarian(authentication);
            case "Teacher" -> roleSidebarMenuService.isTeacher(authentication);
            case "Accountant" -> roleSidebarMenuService.isAccountant(authentication);
            default -> false;
        };
    }

    public void applyDirectoryPermissions(List<Map<String, Object>> staff, Authentication authentication) {
        if (staff == null || staff.isEmpty()) {
            return;
        }

        Optional<String> restrictedRole = resolveStaffDirectoryRestrictedRole(authentication);
        if (restrictedRole.isEmpty()) {
            for (int i = 0; i < staff.size(); i++) {
                Map<String, Object> row = new LinkedHashMap<>(staff.get(i));
                row.put("canView", true);
                row.put("canEdit", true);
                staff.set(i, row);
            }
            return;
        }

        Optional<Long> ownId = resolveLinkedStaffMemberId(authentication);
        if (ownId.isEmpty()) {
            ownId = resolveFallbackStaffIdForRole(restrictedRole.get());
        }
        String loginEmail = authentication != null && authentication.getName() != null
                ? authentication.getName().trim().toLowerCase(Locale.ROOT)
                : "";

        for (int i = 0; i < staff.size(); i++) {
            Map<String, Object> row = new LinkedHashMap<>(staff.get(i));
            boolean isOwn = matchesOwnStaffRecord(row, ownId, loginEmail, restrictedRole.get());
            row.put("canView", isOwn);
            row.put("canEdit", false);
            staff.set(i, row);
        }
    }

    private Optional<Long> resolveFallbackStaffIdForRole(String role) {
        StaffDirectoryRoleProfile profile = STAFF_DIRECTORY_ROLE_PROFILES.get(role);
        if (profile == null) {
            return Optional.empty();
        }

        Optional<Long> byStaffId = staffMemberRepository.findByStaffId(profile.demoStaffId()).map(StaffMember::getId);
        if (byStaffId.isPresent()) {
            return byStaffId;
        }

        Optional<Long> byLoginEmail = staffMemberRepository.findByEmail(profile.loginEmail()).map(StaffMember::getId);
        if (byLoginEmail.isPresent()) {
            return byLoginEmail;
        }

        if (profile.preferredFullName() != null) {
            Optional<Long> byPreferredName = staffMemberRepository.search(profile.searchRole(), null).stream()
                    .filter(member -> profile.preferredFullName().equalsIgnoreCase(formatFullName(member)))
                    .findFirst()
                    .map(StaffMember::getId);
            if (byPreferredName.isPresent()) {
                return byPreferredName;
            }
        }

        List<StaffMember> matches = staffMemberRepository.search(profile.searchRole(), null);
        if (matches.isEmpty()) {
            return Optional.empty();
        }
        if (matches.size() == 1) {
            return Optional.of(matches.get(0).getId());
        }

        return matches.stream()
                .filter(member -> profile.demoStaffId().equals(member.getStaffId()))
                .findFirst()
                .map(StaffMember::getId);
    }

    private boolean matchesOwnStaffRecord(Map<String, Object> row, Optional<Long> ownId, String loginEmail, String restrictedRole) {
        StaffDirectoryRoleProfile profile = STAFF_DIRECTORY_ROLE_PROFILES.get(restrictedRole);
        if (profile == null) {
            return false;
        }

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
        if (profile.demoStaffId().equals(String.valueOf(staffId))) {
            return true;
        }

        Object fullName = row.get("fullName");
        if (profile.preferredFullName() != null && fullName != null
                && profile.preferredFullName().equalsIgnoreCase(String.valueOf(fullName).trim())) {
            return true;
        }

        if (rowHasRole(row, profile.searchRole()) && fullName != null
                && String.valueOf(fullName).toLowerCase(Locale.ROOT).contains(profile.searchRole().toLowerCase(Locale.ROOT))) {
            return profile.preferredFullName() != null;
        }

        return false;
    }

    private boolean rowHasRole(Map<String, Object> row, String expectedRole) {
        Object role = row.get("role");
        if (role != null && roleContains(expectedRole, String.valueOf(role))) {
            return true;
        }
        Object roles = row.get("roles");
        if (roles instanceof Iterable<?> iterable) {
            for (Object value : iterable) {
                if (value != null && roleContains(expectedRole, String.valueOf(value))) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean roleContains(String expectedRole, String actualRole) {
        if (expectedRole == null || actualRole == null) {
            return false;
        }
        for (String part : actualRole.split(",")) {
            if (expectedRole.equalsIgnoreCase(part.trim())) {
                return true;
            }
        }
        return expectedRole.equalsIgnoreCase(actualRole.trim());
    }

    private String formatFullName(StaffMember member) {
        return (member.getFirstName() + " " + (member.getLastName() == null ? "" : member.getLastName())).trim();
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

    public String resolveProfileImageUrl(Authentication authentication) {
        StaffSessionUser sessionUser = resolve(authentication);
        String displayName = sessionUser.getName();
        Optional<StaffMember> staffMember = resolveLinkedStaffMemberId(authentication)
                .flatMap(staffMemberRepository::findById);
        if (staffMember.isPresent()) {
            String photoPath = staffMember.get().getPhotoPath();
            if (photoPath != null && !photoPath.isBlank()) {
                return normalizePublicPath(photoPath);
            }
            displayName = formatFullName(staffMember.get());
        }
        return buildAvatarUrl(displayName);
    }

    private String normalizePublicPath(String path) {
        String trimmed = path.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
            return trimmed;
        }
        return "/uploads/" + trimmed.replace("\\", "/");
    }

    private String buildAvatarUrl(String name) {
        String safeName = name == null || name.isBlank() ? "Staff User" : name.trim();
        return "https://ui-avatars.com/api/?name=" + safeName.replace(" ", "+")
                + "&background=3182ce&color=fff&size=128";
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
