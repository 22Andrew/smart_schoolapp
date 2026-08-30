package com.kantechsolution.smart_school.service;



import org.springframework.security.core.Authentication;

import org.springframework.security.core.GrantedAuthority;

import org.springframework.stereotype.Service;



import java.util.ArrayList;

import java.util.LinkedHashMap;

import java.util.LinkedHashSet;

import java.util.List;

import java.util.Locale;

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

            "reports"

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

            Map.entry("multi-branch", Set.of("overview")),

            Map.entry("gmeet-live-classes", Set.of(

                    "live-classes", "live-meeting", "live-classes-report", "live-meeting-report", "setting")),

            Map.entry("zoom-live-classes", Set.of(

                    "live-meeting", "live-classes", "live-classes-report", "live-meeting-report", "setting")),

            Map.entry("cbse-examination", Set.of(

                    "exam", "exam-schedule", "print-marksheet", "template", "assign-observation", "reports", "setting")),

            Map.entry("examinations", Set.of(

                    "exam-group", "exam-result", "design-admit-card", "print-admit-card",

                    "design-marksheet", "print-marksheet", "marks-grade")),

            Map.entry("attendance", Set.of(

                    "student-attendance", "approve-leave", "attendance-by-date")),

            Map.entry("online-examinations", Set.of("online-exam", "question-bank")),

            Map.entry("academics", Set.of(

                    "class-timetable", "teachers-timetable", "assign-class-teacher",

                    "subject-group", "subjects", "class", "sections")),

            Map.entry("lesson-plan", Set.of(

                    "manage-lesson-plan", "manage-syllabus-status", "lesson", "topic")),

            Map.entry("human-resource", Set.of(

                    "staff-directory", "apply-leave")),

            Map.entry("communicate", Set.of(

                    "notice-board", "send-email", "send-sms", "email-sms-log")),

            Map.entry("download-center", Set.of(

                    "upload-share-content", "content-share-list", "video-tutorial", "content-type")),

            Map.entry("homework", Set.of("add-homework", "daily-assignment")),

            Map.entry("certificate", Set.of(

                    "staff-id-card", "generate-staff-id-card")),

            Map.entry("reports", Set.of(

                    "student-information", "attendance", "examinations",

                    "online-examinations", "lesson-plan", "homework",

                    "transport", "hostel", "alumni"))

    );



    /**
     * Top-level menus visible when logging in as Accountant on the demo admin panel.
     */
    private static final List<String> ACCOUNTANT_MENU_SLUGS = List.of(
            "fees-collection",
            "online-course",
            "behaviour-records",
            "gmeet-live-classes",
            "zoom-live-classes",
            "income",
            "expenses",
            "cbse-examination",
            "human-resource",
            "communicate",
            "inventory",
            "transport",
            "hostel",
            "certificate",
            "reports",
            "system-setting"
    );

    /**
     * Submenu slugs visible to accountants under each main menu (matches Smart School demo).
     */
    private static final Map<String, Set<String>> ACCOUNTANT_ALLOWED_SUBMENU_SLUGS = Map.ofEntries(
            Map.entry("fees-collection", Set.of(
                    "collect-fees", "search-fees-payment", "search-due-fees", "fees-master",
                    "fees-group", "fees-type", "fees-discount", "fees-carry-forward", "fees-reminder")),

            Map.entry("online-course", Set.of(
                    "offline-payment", "course-category", "online-course-report")),

            Map.entry("behaviour-records", Set.of(
                    "assign-incident", "incidents", "reports", "setting")),

            Map.entry("gmeet-live-classes", Set.of(
                    "live-meeting", "live-meeting-report", "setting")),

            Map.entry("zoom-live-classes", Set.of(
                    "live-meeting", "live-classes-report", "live-meeting-report")),

            Map.entry("income", Set.of(
                    "add-income", "search-income", "income-head")),

            Map.entry("expenses", Set.of(
                    "add-expense", "search-expense", "expense-head")),

            Map.entry("cbse-examination", Set.of(
                    "exam", "exam-schedule")),

            Map.entry("human-resource", Set.of(
                    "staff-directory", "staff-attendance", "payroll", "approve-leave-request",
                    "apply-leave", "leave-type", "teachers-rating", "department", "designation",
                    "disabled-staff")),

            Map.entry("communicate", Set.of(
                    "notice-board", "send-email", "send-sms", "email-sms-log")),

            Map.entry("inventory", Set.of(
                    "issue-item", "add-item-stock", "add-item", "item-category", "item-store",
                    "item-supplier")),

            Map.entry("transport", Set.of(
                    "routes", "vehicles", "assign-vehicle")),

            Map.entry("hostel", Set.of(
                    "hostel-rooms", "room-type", "hostel")),

            Map.entry("certificate", Set.of(
                    "staff-id-card", "generate-staff-id-card")),

            Map.entry("reports", Set.of(
                    "finance", "attendance", "human-resource", "inventory", "transport", "hostel",
                    "alumni")),

            Map.entry("system-setting", Set.of(
                    "print-header-footer"))
    );

    /** Online course report tabs visible to accountants on the report page. */
    private static final Set<String> ACCOUNTANT_ONLINE_COURSE_REPORTS = Set.of(
            "coursepurchase", "courserating", "guestreport"
    );

    /** Main menus hidden for Admin (Super Admin still sees all menus). */
    private static final List<String> ADMIN_HIDDEN_MENU_SLUGS = List.of(
            "qr-code-attendance"
    );

    /**
     * Top-level menus visible when logging in as Receptionist on the demo admin panel.
     */
    private static final List<String> RECEPTIONIST_MENU_SLUGS = List.of(
            "front-office",
            "student-information",
            "online-course",
            "gmeet-live-classes",
            "zoom-live-classes",
            "academics",
            "human-resource",
            "communicate",
            "certificate"
    );

    /**
     * Submenu slugs visible to receptionists under each main menu (matches Smart School demo).
     */
    private static final Map<String, Set<String>> RECEPTIONIST_ALLOWED_SUBMENU_SLUGS = Map.ofEntries(
            Map.entry("front-office", Set.of(
                    "admission-enquiry", "visitor-book", "phone-call-log", "postal-dispatch",
                    "postal-receive", "complain", "setup-front-office")),

            Map.entry("student-information", Set.of("student-details")),

            Map.entry("online-course", Set.of(
                    "course-category", "online-course-report")),

            Map.entry("gmeet-live-classes", Set.of(
                    "live-meeting", "live-meeting-report", "setting")),

            Map.entry("zoom-live-classes", Set.of(
                    "live-meeting", "live-classes", "live-classes-report", "setting")),

            Map.entry("academics", Set.of(
                    "class-timetable", "assign-class-teacher",
                    "subject-group", "subjects", "class", "sections")),

            Map.entry("human-resource", Set.of("staff-directory")),

            Map.entry("communicate", Set.of(
                    "notice-board", "send-email", "send-sms", "email-sms-log")),

            Map.entry("certificate", Set.of(
                    "staff-id-card", "generate-staff-id-card"))
    );

    /**
     * Top-level menus visible when logging in as Librarian on the demo admin panel.
     */
    private static final List<String> LIBRARIAN_MENU_SLUGS = List.of(
            "online-course",
            "behaviour-records",
            "gmeet-live-classes",
            "zoom-live-classes",
            "cbse-examination",
            "human-resource",
            "communicate",
            "library",
            "reports"
    );

    /**
     * Submenu slugs visible to librarians (matches Smart School demo librarian sidebar).
     */
    private static final Map<String, Set<String>> LIBRARIAN_ALLOWED_SUBMENU_SLUGS = Map.ofEntries(
            Map.entry("online-course", Set.of(
                    "course-category", "online-course-report")),

            Map.entry("behaviour-records", Set.of(
                    "assign-incident", "incidents", "reports", "setting")),

            Map.entry("gmeet-live-classes", Set.of(
                    "live-classes", "live-meeting", "setting")),

            Map.entry("zoom-live-classes", Set.of(
                    "live-meeting", "live-classes", "live-classes-report", "setting")),

            Map.entry("cbse-examination", Set.of(
                    "exam", "template", "setting")),

            Map.entry("human-resource", Set.of(
                    "staff-directory")),

            Map.entry("communicate", Set.of(
                    "notice-board", "send-email", "send-sms", "email-sms-log")),

            Map.entry("library", Set.of(
                    "book-list", "issue-return", "add-student", "add-staff-member")),

            Map.entry("reports", Set.of(
                    "library"))
    );

    public Map<String, Object> filterForRole(Map<String, Object> settings, Authentication authentication) {

        if (settings == null || authentication == null) {

            return settings;

        }

        if (isTeacher(authentication)) {

            return filterTeacherMenus(settings);

        }

        if (isAccountant(authentication)) {

            return filterAccountantMenus(settings);

        }

        if (isReceptionist(authentication)) {

            return filterReceptionistMenus(settings);

        }

        if (isLibrarian(authentication)) {

            return filterLibrarianMenus(settings);

        }

        if (isAdmin(authentication)) {

            return filterAdminMenus(settings);

        }

        return settings;

    }



    public boolean isTeacher(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_TEACHER");

    }

    public boolean isAccountant(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_ACCOUNTANT");

    }

    public boolean isReceptionist(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_RECEPTIONIST");

    }

    public boolean isLibrarian(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_LIBRARIAN");

    }

    public boolean isAdmin(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_ADMIN");

    }

    public boolean isSuperAdmin(Authentication authentication) {

        return authentication != null && hasAuthority(authentication, "ROLE_SUPER_ADMIN");

    }

    public boolean isAdminDashboardUser(Authentication authentication) {

        if (authentication == null) {
            return false;
        }
        if (isTeacher(authentication) || isAccountant(authentication) || isReceptionist(authentication)
                || isLibrarian(authentication)) {
            return false;
        }
        return isAdmin(authentication) || isSuperAdmin(authentication);

    }

    public List<String> getAdminHiddenMenuSlugs() {

        return ADMIN_HIDDEN_MENU_SLUGS;

    }

    public List<String> getReceptionistMenuSlugs() {

        return RECEPTIONIST_MENU_SLUGS;

    }

    public Map<String, Set<String>> getReceptionistAllowedSubmenuSlugs() {

        return RECEPTIONIST_ALLOWED_SUBMENU_SLUGS;

    }

    public List<String> getLibrarianMenuSlugs() {

        return LIBRARIAN_MENU_SLUGS;

    }

    public Map<String, Set<String>> getLibrarianAllowedSubmenuSlugs() {

        return LIBRARIAN_ALLOWED_SUBMENU_SLUGS;

    }

    public List<String> getAccountantMenuSlugs() {

        return ACCOUNTANT_MENU_SLUGS;

    }

    public Map<String, Set<String>> getAccountantAllowedSubmenuSlugs() {

        return ACCOUNTANT_ALLOWED_SUBMENU_SLUGS;

    }

    public boolean isAccountantSubmenuAllowed(String parentSlug, String submenuSlug) {

        if (parentSlug == null || submenuSlug == null) {

            return false;

        }

        Set<String> allowed = ACCOUNTANT_ALLOWED_SUBMENU_SLUGS.get(parentSlug);

        return allowed != null && allowed.contains(submenuSlug);

    }

    public boolean isAccountantOnlineCourseReportAllowed(String reportKey) {

        if (reportKey == null || reportKey.isBlank()) {

            return false;

        }

        return ACCOUNTANT_ONLINE_COURSE_REPORTS.contains(reportKey.toLowerCase(Locale.ROOT));

    }

    public Set<String> getAccountantOnlineCourseReports() {

        return ACCOUNTANT_ONLINE_COURSE_REPORTS;

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

    private Map<String, Object> filterAccountantMenus(Map<String, Object> settings) {

        Map<String, Object> filtered = new LinkedHashMap<>(settings);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> selectedMenus =
                (List<Map<String, Object>>) settings.getOrDefault("selectedMenus", List.of());
        Map<String, Map<String, Object>> selectedBySlug = indexMenusBySlug(selectedMenus);

        List<Map<String, Object>> accountantMenus = new ArrayList<>();
        int order = 1;
        for (String slug : ACCOUNTANT_MENU_SLUGS) {
            Map<String, Object> menu = selectedBySlug.get(slug);
            if (menu != null) {
                Map<String, Object> copy = new LinkedHashMap<>(menu);
                copy.put("sortOrder", order++);
                accountantMenus.add(copy);
            }
        }
        filtered.put("selectedMenus", accountantMenus);

        @SuppressWarnings("unchecked")
        Map<String, List<Map<String, Object>>> submenus =
                (Map<String, List<Map<String, Object>>>) settings.getOrDefault("submenus", Map.of());
        Map<String, List<Map<String, Object>>> accountantSubmenus = new LinkedHashMap<>();

        for (String parentSlug : ACCOUNTANT_MENU_SLUGS) {
            List<Map<String, Object>> items = submenus.get(parentSlug);
            if (items == null || items.isEmpty()) {
                continue;
            }
            accountantSubmenus.put(parentSlug, filterAccountantSubmenus(parentSlug, items));
        }
        filtered.put("submenus", accountantSubmenus);
        return filtered;
    }

    private List<Map<String, Object>> filterAccountantSubmenus(String parentSlug, List<Map<String, Object>> items) {

        Set<String> allowed = ACCOUNTANT_ALLOWED_SUBMENU_SLUGS.getOrDefault(parentSlug, Set.of());

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

    private Map<String, Object> filterReceptionistMenus(Map<String, Object> settings) {

        Map<String, Object> filtered = new LinkedHashMap<>(settings);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> selectedMenus =
                (List<Map<String, Object>>) settings.getOrDefault("selectedMenus", List.of());
        Map<String, Map<String, Object>> selectedBySlug = indexMenusBySlug(selectedMenus);

        List<Map<String, Object>> receptionistMenus = new ArrayList<>();
        int order = 1;
        for (String slug : RECEPTIONIST_MENU_SLUGS) {
            Map<String, Object> menu = selectedBySlug.get(slug);
            if (menu != null) {
                Map<String, Object> copy = new LinkedHashMap<>(menu);
                copy.put("sortOrder", order++);
                receptionistMenus.add(copy);
            }
        }
        filtered.put("selectedMenus", receptionistMenus);

        @SuppressWarnings("unchecked")
        Map<String, List<Map<String, Object>>> submenus =
                (Map<String, List<Map<String, Object>>>) settings.getOrDefault("submenus", Map.of());
        Map<String, List<Map<String, Object>>> receptionistSubmenus = new LinkedHashMap<>();

        for (String parentSlug : RECEPTIONIST_MENU_SLUGS) {
            List<Map<String, Object>> items = submenus.get(parentSlug);
            if (items == null || items.isEmpty()) {
                continue;
            }
            receptionistSubmenus.put(parentSlug, filterReceptionistSubmenus(parentSlug, items));
        }
        filtered.put("submenus", receptionistSubmenus);
        return filtered;
    }

    private Map<String, Object> filterLibrarianMenus(Map<String, Object> settings) {

        Map<String, Object> filtered = new LinkedHashMap<>(settings);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> selectedMenus =
                (List<Map<String, Object>>) settings.getOrDefault("selectedMenus", List.of());
        Map<String, Map<String, Object>> selectedBySlug = indexMenusBySlug(selectedMenus);

        List<Map<String, Object>> librarianMenus = new ArrayList<>();
        int order = 1;
        for (String slug : LIBRARIAN_MENU_SLUGS) {
            Map<String, Object> menu = selectedBySlug.get(slug);
            if (menu != null) {
                Map<String, Object> copy = new LinkedHashMap<>(menu);
                copy.put("sortOrder", order++);
                librarianMenus.add(copy);
            }
        }
        filtered.put("selectedMenus", librarianMenus);

        @SuppressWarnings("unchecked")
        Map<String, List<Map<String, Object>>> submenus =
                (Map<String, List<Map<String, Object>>>) settings.getOrDefault("submenus", Map.of());
        Map<String, List<Map<String, Object>>> librarianSubmenus = new LinkedHashMap<>();

        for (String parentSlug : LIBRARIAN_MENU_SLUGS) {
            List<Map<String, Object>> items = submenus.get(parentSlug);
            if (items == null || items.isEmpty()) {
                continue;
            }
            librarianSubmenus.put(parentSlug, filterLibrarianSubmenus(parentSlug, items));
        }
        filtered.put("submenus", librarianSubmenus);
        return filtered;
    }

    private List<Map<String, Object>> filterLibrarianSubmenus(String parentSlug, List<Map<String, Object>> items) {

        Set<String> allowed = LIBRARIAN_ALLOWED_SUBMENU_SLUGS.getOrDefault(parentSlug, Set.of());

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

    private List<Map<String, Object>> filterReceptionistSubmenus(String parentSlug, List<Map<String, Object>> items) {

        Set<String> allowed = RECEPTIONIST_ALLOWED_SUBMENU_SLUGS.getOrDefault(parentSlug, Set.of());

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

    private Map<String, Object> filterAdminMenus(Map<String, Object> settings) {

        Map<String, Object> filtered = new LinkedHashMap<>(settings);
        Set<String> hidden = new LinkedHashSet<>(ADMIN_HIDDEN_MENU_SLUGS);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> selectedMenus =
                (List<Map<String, Object>>) settings.getOrDefault("selectedMenus", List.of());
        List<Map<String, Object>> adminMenus = new ArrayList<>();
        for (Map<String, Object> menu : selectedMenus) {
            String slug = String.valueOf(menu.getOrDefault("slug", ""));
            if (!hidden.contains(slug)) {
                adminMenus.add(menu);
            }
        }
        filtered.put("selectedMenus", adminMenus);

        @SuppressWarnings("unchecked")
        Map<String, List<Map<String, Object>>> submenus =
                (Map<String, List<Map<String, Object>>>) settings.getOrDefault("submenus", Map.of());
        Map<String, List<Map<String, Object>>> adminSubmenus = new LinkedHashMap<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : submenus.entrySet()) {
            if (!hidden.contains(entry.getKey())) {
                adminSubmenus.put(entry.getKey(), entry.getValue());
            }
        }
        filtered.put("submenus", adminSubmenus);
        return filtered;

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


