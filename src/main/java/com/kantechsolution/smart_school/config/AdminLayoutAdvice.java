package com.kantechsolution.smart_school.config;

import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.service.AcademicSessionService;
import com.kantechsolution.smart_school.service.AppBrandingService;
import com.kantechsolution.smart_school.service.RoleSidebarMenuService;
import com.kantechsolution.smart_school.service.StaffSessionService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;
import java.util.Map;
import java.util.Set;

@ControllerAdvice
@RequiredArgsConstructor
public class AdminLayoutAdvice {

    private final RoleSidebarMenuService roleSidebarMenuService;
    private final AcademicSessionService academicSessionService;
    private final NoticeBoardRepository noticeBoardRepository;
    private final StaffSessionService staffSessionService;
    private final AppBrandingService appBrandingService;

    @ModelAttribute
    public void bindStaffSession(Authentication authentication, HttpSession session) {
        if (!staffSessionService.isStaffPanelUser(authentication)) {
            return;
        }
        session.setAttribute("user", staffSessionService.resolve(authentication));
    }

    @ModelAttribute("staffRole")
    public String staffRole(Authentication authentication) {
        return roleSidebarMenuService.resolveRoleLabel(authentication);
    }

    @ModelAttribute("staffUserName")
    public String staffUserName(Authentication authentication) {
        return staffSessionService.resolve(authentication).getName();
    }

    @ModelAttribute("staffDashboardUrl")
    public String staffDashboardUrl(Authentication authentication) {
        return staffSessionService.resolveDashboardUrl(authentication);
    }

    @ModelAttribute("roleBasedSidebar")
    public boolean roleBasedSidebar(Authentication authentication) {
        return staffSessionService.usesRoleBasedSidebar(authentication);
    }

    @ModelAttribute("currentSession")
    public String currentSession() {
        return academicSessionService.getCurrentSessionName();
    }

    @ModelAttribute("schoolName")
    public String schoolName() {
        Object value = appBrandingService.getBranding().get("schoolName");
        return value != null && !String.valueOf(value).isBlank() ? String.valueOf(value) : "Smart School";
    }

    @ModelAttribute("noticeCount")
    public long noticeCount() {
        return noticeBoardRepository.count();
    }

    @ModelAttribute("teacherSidebar")
    public boolean teacherSidebar(Authentication authentication) {
        return roleSidebarMenuService.isTeacher(authentication);
    }

    @ModelAttribute("teacherSidebarMenus")
    public List<String> teacherSidebarMenus(Authentication authentication) {
        if (!roleSidebarMenuService.isTeacher(authentication)) {
            return List.of();
        }
        return roleSidebarMenuService.getTeacherMenuSlugs();
    }

    @ModelAttribute("teacherSidebarSubmenus")
    public Map<String, Set<String>> teacherSidebarSubmenus(Authentication authentication) {
        if (!roleSidebarMenuService.isTeacher(authentication)) {
            return Map.of();
        }
        return roleSidebarMenuService.getTeacherAllowedSubmenuSlugs();
    }

    @ModelAttribute("accountantSidebar")
    public boolean accountantSidebar(Authentication authentication) {
        return roleSidebarMenuService.isAccountant(authentication);
    }

    @ModelAttribute("accountantSidebarMenus")
    public List<String> accountantSidebarMenus(Authentication authentication) {
        if (!roleSidebarMenuService.isAccountant(authentication)) {
            return List.of();
        }
        return roleSidebarMenuService.getAccountantMenuSlugs();
    }

    @ModelAttribute("accountantSidebarSubmenus")
    public Map<String, Set<String>> accountantSidebarSubmenus(Authentication authentication) {
        if (!roleSidebarMenuService.isAccountant(authentication)) {
            return Map.of();
        }
        return roleSidebarMenuService.getAccountantAllowedSubmenuSlugs();
    }

    @ModelAttribute("receptionistSidebar")
    public boolean receptionistSidebar(Authentication authentication) {
        return roleSidebarMenuService.isReceptionist(authentication);
    }

    @ModelAttribute("receptionistSidebarMenus")
    public List<String> receptionistSidebarMenus(Authentication authentication) {
        if (!roleSidebarMenuService.isReceptionist(authentication)) {
            return List.of();
        }
        return roleSidebarMenuService.getReceptionistMenuSlugs();
    }

    @ModelAttribute("receptionistSidebarSubmenus")
    public Map<String, Set<String>> receptionistSidebarSubmenus(Authentication authentication) {
        if (!roleSidebarMenuService.isReceptionist(authentication)) {
            return Map.of();
        }
        return roleSidebarMenuService.getReceptionistAllowedSubmenuSlugs();
    }

    @ModelAttribute("librarianSidebar")
    public boolean librarianSidebar(Authentication authentication) {
        return roleSidebarMenuService.isLibrarian(authentication);
    }

    @ModelAttribute("librarianSidebarMenus")
    public List<String> librarianSidebarMenus(Authentication authentication) {
        if (!roleSidebarMenuService.isLibrarian(authentication)) {
            return List.of();
        }
        return roleSidebarMenuService.getLibrarianMenuSlugs();
    }

    @ModelAttribute("librarianSidebarSubmenus")
    public Map<String, Set<String>> librarianSidebarSubmenus(Authentication authentication) {
        if (!roleSidebarMenuService.isLibrarian(authentication)) {
            return Map.of();
        }
        return roleSidebarMenuService.getLibrarianAllowedSubmenuSlugs();
    }

    @ModelAttribute("adminSidebar")
    public boolean adminSidebar(Authentication authentication) {
        return roleSidebarMenuService.isAdmin(authentication);
    }

    @ModelAttribute("staffDirectoryRestricted")
    public boolean staffDirectoryRestricted(Authentication authentication) {
        return staffSessionService.isStaffDirectoryRestricted(authentication);
    }

    @ModelAttribute("currentStaffMemberId")
    public Long currentStaffMemberId(Authentication authentication) {
        return staffSessionService.resolveLinkedStaffMemberId(authentication).orElse(null);
    }

    @ModelAttribute("staffUserEmail")
    public String staffUserEmail(Authentication authentication) {
        return staffSessionService.resolve(authentication).getEmail();
    }
}
