package com.kantechsolution.smart_school.config;

import com.kantechsolution.smart_school.service.AcademicSessionService;
import com.kantechsolution.smart_school.service.RoleSidebarMenuService;
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

    @ModelAttribute("staffRole")
    public String staffRole(Authentication authentication) {
        return roleSidebarMenuService.resolveRoleLabel(authentication);
    }

    @ModelAttribute("currentSession")
    public String currentSession() {
        return academicSessionService.getCurrentSessionName();
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
}
