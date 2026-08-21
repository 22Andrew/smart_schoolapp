package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppModule;
import com.kantechsolution.smart_school.repository.AppModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Order(40)
public class AppModuleService implements ApplicationRunner {

    private static final String TYPE_SYSTEM = "SYSTEM";
    private static final String TYPE_STUDENT = "STUDENT";
    private static final String TYPE_PARENT = "PARENT";

    /** Matches demo System tab: https://demo.smart-school.in/admin/module */
    private static final String[][] SYSTEM_MODULES = {
            {"fees-collection", "Fees Collection", "true"},
            {"income", "Income", "true"},
            {"expense", "Expense", "true"},
            {"student-attendance", "Student Attendance", "true"},
            {"examination", "Examination", "true"},
            {"download-center", "Download Center", "true"},
            {"library", "Library", "true"},
            {"inventory", "Inventory", "true"},
            {"transport", "Transport", "true"},
            {"hostel", "Hostel", "true"},
            {"communicate", "Communicate", "true"},
            {"front-cms", "Front CMS", "true"},
            {"front-office", "Front Office", "true"},
            {"homework", "Homework", "true"},
            {"certificate", "Certificate", "true"},
            {"calendar-todo", "Calendar To Do List", "true"},
            {"online-examination", "Online Examination", "true"},
            {"chat", "Chat", "true"},
            {"multi-class", "Multi Class", "true"},
            {"online-admission", "Online Admission", "true"},
            {"alumni", "Alumni", "true"},
            {"lesson-plan", "Lesson Plan", "true"},
            {"annual-calendar", "Annual Calendar", "true"},
            {"student-cv", "Student CV", "true"},
            {"zoom-live-classes", "Zoom Live Classes", "true"},
            {"gmeet-live-classes", "Gmeet Live Classes", "true"},
            {"online-course", "Online Course", "true"},
            {"behaviour-records", "Behaviour Records", "true"},
            {"cbse-examination", "CBSE Examination", "true"},
            {"multi-branch", "Multi Branch", "true"},
            {"two-factor-authenticator", "Two Factor Authenticator", "false"},
            {"qr-code-attendance", "QR Code Attendance", "true"},
            {"quick-fees", "Quick Fees", "true"},
            {"thermal-print", "Thermal Print", "true"},
            {"whatsapp-messaging", "Whatsapp Messaging", "true"}
    };

    /**
     * Shared student/parent panel modules (Smart School permission_student table).
     * Column 3 = default enabled for Student tab, column 4 = default enabled for Parent tab.
     * Both tabs show the same module names in the same order, like the demo.
     */
    private static final String[][] PANEL_MODULES = {
            {"fees", "Fees", "true", "true"},
            {"homework", "Homework", "true", "true"},
            {"exam-schedule", "Exam Schedule", "true", "true"},
            {"exam-result", "Exam Result", "true", "true"},
            {"online-exam", "Online Exam", "true", "false"},
            {"download-center", "Download Center", "true", "true"},
            {"attendance", "Attendance", "true", "true"},
            {"timeline", "Timeline", "true", "false"},
            {"syllabus-status", "Syllabus Status", "true", "true"},
            {"teacher-review", "Teacher Review", "true", "true"},
            {"library", "Library", "true", "true"},
            {"transport", "Transport", "true", "true"},
            {"hostel", "Hostel", "true", "true"},
            {"calendar-todo", "Calendar To Do List", "true", "true"},
            {"chat", "Chat", "true", "true"},
            {"online-course", "Online Course", "true", "true"},
            {"leave", "Leave", "true", "true"},
            {"apply-leave", "Apply Leave", "true", "true"},
            {"student-cv", "Student CV", "true", "false"},
            {"zoom-live-classes", "Zoom Live Classes", "true", "false"},
            {"gmeet-live-classes", "Gmeet Live Classes", "true", "false"},
            {"behaviour-records", "Behaviour Records", "true", "true"},
            {"online-admission", "Online Admission", "false", "true"}
    };

    private final AppModuleRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        syncModules(TYPE_SYSTEM, SYSTEM_MODULES);
        syncPanelModules();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listByType(String type) {
        return repository.findByModuleTypeOrderBySortOrderAscNameAsc(normalizeType(type)).stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> setEnabled(Long id, boolean enabled) {
        AppModule module = requireModule(id);
        module.setEnabled(enabled);
        return toMap(repository.save(module));
    }

    private void syncPanelModules() {
        Map<String, AppModule> studentBySlug = modulesBySlug(TYPE_STUDENT);
        Map<String, AppModule> parentBySlug = modulesBySlug(TYPE_PARENT);
        Set<String> canonicalSlugs = new HashSet<>();

        for (int i = 0; i < PANEL_MODULES.length; i++) {
            String[] row = PANEL_MODULES[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            boolean studentEnabled = Boolean.parseBoolean(row[2]);
            boolean parentEnabled = Boolean.parseBoolean(row[3]);
            upsertModule(studentBySlug.get(slug), TYPE_STUDENT, slug, row[1], studentEnabled, i + 1);
            upsertModule(parentBySlug.get(slug), TYPE_PARENT, slug, row[1], parentEnabled, i + 1);
        }

        removeStaleModules(TYPE_STUDENT, canonicalSlugs, studentBySlug);
        removeStaleModules(TYPE_PARENT, canonicalSlugs, parentBySlug);
    }

    private void syncModules(String moduleType, String[][] rows) {
        Map<String, AppModule> existingBySlug = modulesBySlug(moduleType);
        Set<String> canonicalSlugs = new HashSet<>();

        for (int i = 0; i < rows.length; i++) {
            String[] row = rows[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            boolean defaultEnabled = Boolean.parseBoolean(row[2]);
            upsertModule(existingBySlug.get(slug), moduleType, slug, row[1], defaultEnabled, i + 1);
        }

        removeStaleModules(moduleType, canonicalSlugs, existingBySlug);
    }

    private Map<String, AppModule> modulesBySlug(String moduleType) {
        Map<String, AppModule> bySlug = new LinkedHashMap<>();
        for (AppModule module : repository.findByModuleTypeOrderBySortOrderAscNameAsc(moduleType)) {
            bySlug.putIfAbsent(module.getSlug(), module);
        }
        return bySlug;
    }

    private void upsertModule(AppModule existing,
                              String moduleType,
                              String slug,
                              String name,
                              boolean defaultEnabled,
                              int sortOrder) {
        if (existing == null) {
            repository.save(AppModule.builder()
                    .moduleType(moduleType)
                    .slug(slug)
                    .name(name)
                    .enabled(defaultEnabled)
                    .sortOrder(sortOrder)
                    .build());
            return;
        }

        existing.setName(name);
        existing.setSortOrder(sortOrder);
        if (existing.getEnabled() == null) {
            existing.setEnabled(defaultEnabled);
        }
        repository.save(existing);
    }

    private void removeStaleModules(String moduleType, Set<String> canonicalSlugs, Map<String, AppModule> existingBySlug) {
        existingBySlug.values().stream()
                .filter(module -> !canonicalSlugs.contains(module.getSlug()))
                .forEach(module -> repository.deleteById(module.getId()));
    }

    private AppModule requireModule(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Module not found"));
    }

    private Map<String, Object> toMap(AppModule module) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", module.getId());
        map.put("slug", module.getSlug());
        map.put("name", module.getName());
        map.put("enabled", Boolean.TRUE.equals(module.getEnabled()));
        map.put("moduleType", module.getModuleType());
        map.put("sortOrder", module.getSortOrder());
        return map;
    }

    private String normalizeType(String type) {
        if (type == null) {
            return TYPE_SYSTEM;
        }
        return switch (type.trim().toLowerCase(Locale.ROOT)) {
            case "student", "students" -> TYPE_STUDENT;
            case "parent", "parents" -> TYPE_PARENT;
            default -> TYPE_SYSTEM;
        };
    }
}
