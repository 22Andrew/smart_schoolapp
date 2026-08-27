package com.kantechsolution.smart_school.service;



import org.springframework.security.core.Authentication;

import org.springframework.security.core.GrantedAuthority;

import org.springframework.stereotype.Service;



import java.util.ArrayList;

import java.util.LinkedHashMap;

import java.util.LinkedHashSet;

import java.util.List;

import java.util.Map;

import java.util.Set;



/**

 * Filters admin sidebar menus by staff role to match Smart School demo behaviour.

 */

@Service

public class RoleSidebarMenuService {



    /**

     * Top-level menus visible when logging in as Teacher on the demo admin panel.

     */

    private static final List<String> TEACHER_MENU_SLUGS = List.of(

            "student-information",

            "online-course",

            "behaviour-records",

            "multi-branch",

            "gmeet-live-classes",

            "zoom-live-classes",

            "cbse-examination",

            "examinations",

            "attendance",

            "online-examinations",

            "academics",

            "lesson-plan",

            "human-resource",

            "communicate",

            "download-center",

            "homework",

            "certificate",

            "reports",

            "system-setting"

    );



    /**

     * Submenu slugs visible to teachers under each main menu (matches Smart School demo).

     */

    private static final Map<String, Set<String>> TEACHER_ALLOWED_SUBMENU_SLUGS = Map.ofEntries(

            Map.entry("student-information", Set.of(
                    "student-details", "student-admission", "disabled-students", "multi-class-student",
                    "bulk-delete", "student-categories", "student-house", "disable-reason")),

            Map.entry("online-course", Set.of(

                    "online-course", "course-category", "online-course-report")),

            Map.entry("behaviour-records", Set.of(

                    "assign-incident", "incidents", "reports", "setting")),

            Map.entry("multi-branch", Set.of("overview", "report")),

            Map.entry("gmeet-live-classes", Set.of(

                    "live-classes", "live-meeting", "live-classes-report", "live-meeting-report")),

            Map.entry("zoom-live-classes", Set.of(

                    "live-classes", "live-meeting", "live-classes-report", "live-meeting-report")),

            Map.entry("cbse-examination", Set.of(

                    "exam", "exam-schedule", "print-marksheet", "assign-observation", "admit-card", "reports")),

            Map.entry("examinations", Set.of(

                    "exam-group", "exam-schedule", "exam-result", "print-admit-card",

                    "print-marksheet", "marks-grade", "marks-division")),

            Map.entry("attendance", Set.of(

                    "student-attendance", "approve-leave", "attendance-by-date")),

            Map.entry("online-examinations", Set.of("online-exam", "question-bank")),

            Map.entry("academics", Set.of(

                    "class-timetable", "teachers-timetable", "assign-class-teacher",

                    "subject-group", "subjects")),

            Map.entry("lesson-plan", Set.of(

                    "copy-old-lessons", "manage-lesson-plan", "manage-syllabus-status", "lesson", "topic")),

            Map.entry("human-resource", Set.of(

                    "staff-attendance", "apply-leave", "teachers-rating")),

            Map.entry("communicate", Set.of("notice-board")),

            Map.entry("download-center", Set.of(

                    "upload-share-content", "content-share-list", "video-tutorial")),

            Map.entry("homework", Set.of("add-homework", "daily-assignment")),

            Map.entry("certificate", Set.of(

                    "transfer-certificate", "student-certificate", "generate-certificate",

                    "student-id-card", "generate-id-card", "staff-id-card", "generate-staff-id-card")),

            Map.entry("reports", Set.of(

                    "student-information", "attendance", "examinations",

                    "online-examinations", "lesson-plan", "homework")),

            Map.entry("system-setting", Set.of("general-setting"))

    );



    public Map<String, Object> filterForRole(Map<String, Object> settings, Authentication authentication) {

        if (settings == null || authentication == null || !isTeacher(authentication)) {

            return settings;

        }

        return filterTeacherMenus(settings);

    }



    public boolean isTeacher(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_TEACHER");

    }



    public boolean isTeacherSubmenuAllowed(String parentSlug, String submenuSlug) {

        if (parentSlug == null || submenuSlug == null) {

            return false;

        }

        Set<String> allowed = TEACHER_ALLOWED_SUBMENU_SLUGS.get(parentSlug);

        return allowed != null && allowed.contains(submenuSlug);

    }



    public boolean isTeacherMenuAllowed(String menuSlug) {

        return menuSlug != null && TEACHER_MENU_SLUGS.contains(menuSlug);

    }



    public List<String> getTeacherMenuSlugs() {

        return TEACHER_MENU_SLUGS;

    }



    public Map<String, Set<String>> getTeacherAllowedSubmenuSlugs() {

        return TEACHER_ALLOWED_SUBMENU_SLUGS;

    }



    public String resolveRoleLabel(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {

            return "";

        }

        if (hasAuthority(authentication, "ROLE_SUPER_ADMIN")) {

            return "Super Admin";

        }

        if (hasAuthority(authentication, "ROLE_ADMIN")) {

            return "Admin";

        }

        if (hasAuthority(authentication, "ROLE_TEACHER")) {

            return "Teacher";

        }

        if (hasAuthority(authentication, "ROLE_ACCOUNTANT")) {

            return "Accountant";

        }

        if (hasAuthority(authentication, "ROLE_LIBRARIAN")) {

            return "Librarian";

        }

        if (hasAuthority(authentication, "ROLE_RECEPTIONIST")) {

            return "Receptionist";

        }

        return authentication.getAuthorities().stream()

                .map(GrantedAuthority::getAuthority)

                .findFirst()

                .orElse("");

    }



    private Map<String, Object> filterTeacherMenus(Map<String, Object> settings) {

        Map<String, Object> filtered = new LinkedHashMap<>(settings);



        @SuppressWarnings("unchecked")

        List<Map<String, Object>> selectedMenus =

                (List<Map<String, Object>>) settings.getOrDefault("selectedMenus", List.of());

        Map<String, Map<String, Object>> selectedBySlug = indexMenusBySlug(selectedMenus);



        List<Map<String, Object>> teacherMenus = new ArrayList<>();

        int order = 1;

        for (String slug : TEACHER_MENU_SLUGS) {

            Map<String, Object> menu = selectedBySlug.get(slug);

            if (menu != null) {

                Map<String, Object> copy = new LinkedHashMap<>(menu);

                copy.put("sortOrder", order++);

                teacherMenus.add(copy);

            }

        }

        filtered.put("selectedMenus", teacherMenus);



        @SuppressWarnings("unchecked")

        Map<String, List<Map<String, Object>>> submenus =

                (Map<String, List<Map<String, Object>>>) settings.getOrDefault("submenus", Map.of());

        Map<String, List<Map<String, Object>>> teacherSubmenus = new LinkedHashMap<>();



        for (String parentSlug : TEACHER_MENU_SLUGS) {

            List<Map<String, Object>> items = submenus.get(parentSlug);

            if (items == null || items.isEmpty()) {

                continue;

            }

            teacherSubmenus.put(parentSlug, filterTeacherSubmenus(parentSlug, items));

        }

        filtered.put("submenus", teacherSubmenus);

        return filtered;

    }



    private List<Map<String, Object>> filterTeacherSubmenus(String parentSlug, List<Map<String, Object>> items) {

        Set<String> allowed = TEACHER_ALLOWED_SUBMENU_SLUGS.getOrDefault(parentSlug, Set.of());

        List<Map<String, Object>> visible = new ArrayList<>();

        int order = 1;

        for (Map<String, Object> item : items) {

            String slug = String.valueOf(item.getOrDefault("slug", ""));

            if (!allowed.contains(slug)) {

                continue;

            }

            Map<String, Object> copy = new LinkedHashMap<>(item);

            copy.put("selected", true);

            copy.put("sortOrder", order++);

            visible.add(copy);

        }

        return visible;

    }



    private Map<String, Map<String, Object>> indexMenusBySlug(List<Map<String, Object>> menus) {

        Map<String, Map<String, Object>> bySlug = new LinkedHashMap<>();

        for (Map<String, Object> menu : menus) {

            Object slug = menu.get("slug");

            if (slug != null) {

                bySlug.put(String.valueOf(slug), menu);

            }

        }

        return bySlug;

    }



    private boolean hasAuthority(Authentication authentication, String authority) {

        if (authentication == null) {

            return false;

        }

        return authentication.getAuthorities().stream()

                .map(GrantedAuthority::getAuthority)

                .anyMatch(value -> value.equalsIgnoreCase(authority));

    }

}


