package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppStudentDashboardWidget;
import com.kantechsolution.smart_school.model.AppStudentProfileEditField;
import com.kantechsolution.smart_school.model.AppStudentProfileSetting;
import com.kantechsolution.smart_school.repository.AppStudentDashboardWidgetRepository;
import com.kantechsolution.smart_school.repository.AppStudentProfileEditFieldRepository;
import com.kantechsolution.smart_school.repository.AppStudentProfileSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Order(43)
public class AppStudentProfileSettingService implements ApplicationRunner {

    private static final String[][] EDIT_FIELDS = {
            {"roll_no", "Roll Number", "true"},
            {"middlename", "Middle Name", "true"},
            {"lastname", "Last Name", "true"},
            {"category", "Category", "true"},
            {"religion", "Religion", "true"},
            {"cast", "Caste", "true"},
            {"mobile_no", "Mobile Number", "true"},
            {"student_email", "Email", "true"},
            {"admission_date", "Admission Date", "true"},
            {"student_photo", "Student Photo", "true"},
            {"is_student_house", "House", "true"},
            {"is_blood_group", "Blood Group", "true"},
            {"student_height", "Height", "true"},
            {"student_weight", "Weight", "true"},
            {"measurement_date", "Measurement Date", "true"},
            {"father_name", "Father Name", "true"},
            {"father_phone", "Father Phone", "true"},
            {"father_occupation", "Father Occupation", "true"},
            {"father_pic", "Father Photo", "true"},
            {"mother_name", "Mother Name", "true"},
            {"mother_phone", "Mother Phone", "true"},
            {"mother_occupation", "Mother Occupation", "true"},
            {"mother_pic", "Mother Photo", "true"},
            {"guardian_name", "Guardian Name", "true"},
            {"guardian_phone", "Guardian Phone", "true"},
            {"guardian_relation", "Guardian Relation", "true"},
            {"guardian_email", "Guardian Email", "true"},
            {"guardian_occupation", "Guardian Occupation", "true"},
            {"guardian_pic", "Guardian Photo", "true"},
            {"guardian_address", "Guardian Address", "true"},
            {"current_address", "If Guardian Address Is Current Address", "true"},
            {"permanent_address", "If Permanent Address Is Current Address", "true"},
            {"route_list", "Route List", "true"},
            {"hostel_id", "Hostel Details", "true"},
            {"bank_account_no", "Bank Account Number", "true"},
            {"bank_name", "Bank Name", "true"},
            {"ifsc_code", "IFSC Code", "true"},
            {"national_identification_no", "National Identification Number", "true"},
            {"local_identification_no", "Local Identification Number", "true"},
            {"rte", "RTE", "true"},
            {"previous_school_details", "Previous School Details", "true"},
            {"student_note", "Note", "true"},
            {"upload_documents", "Upload Documents", "true"},
            {"student_barcode", "Barcode", "true"}
    };

    private static final String[][] DASHBOARD_WIDGETS = {
            {"welcome_student", "Welcome Student", "true", "true"},
            {"notice_board", "Notice Board", "true", "true"},
            {"subject_progress", "Subject Progress", "true", "true"},
            {"upcomming_class", "Upcomming Class", "true", "true"},
            {"homework", "Homework", "true", "true"},
            {"teacher_list", "Teacher List", "true", "true"},
            {"visitor_list", "Visitor List", "true", "true"},
            {"library", "Library", "true", "true"}
    };

    private final AppStudentProfileSettingRepository settingRepository;
    private final AppStudentProfileEditFieldRepository editFieldRepository;
    private final AppStudentDashboardWidgetRepository dashboardWidgetRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureSettings();
        syncEditFields();
        syncDashboardWidgets();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfileUpdateSettings() {
        AppStudentProfileSetting settings = requireSettings();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("allowEditableFormFields", Boolean.TRUE.equals(settings.getAllowEditableFormFields()));
        map.put("editFields", listEditFields());
        return map;
    }

    @Transactional
    public Map<String, Object> saveAllowEditable(boolean allowEditable) {
        AppStudentProfileSetting settings = requireSettings();
        settings.setAllowEditableFormFields(allowEditable);
        settingRepository.save(settings);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("allowEditableFormFields", allowEditable);
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listEditFields() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (AppStudentProfileEditField field : editFieldRepository.findAllByOrderBySortOrderAscNameAsc()) {
            rows.add(toEditFieldMap(field));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> setEditFieldEnabled(String slug, boolean enabled) {
        AppStudentProfileEditField field = editFieldRepository.findBySlug(normalizeSlug(slug))
                .orElseThrow(() -> new IllegalArgumentException("Profile edit field not found"));
        field.setEnabled(enabled);
        return toEditFieldMap(editFieldRepository.save(field));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listDashboardWidgets() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (AppStudentDashboardWidget widget : dashboardWidgetRepository.findAllByOrderBySortOrderAscNameAsc()) {
            rows.add(toWidgetMap(widget));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> setDashboardWidgetEnabled(String slug, String panel, boolean enabled) {
        AppStudentDashboardWidget widget = dashboardWidgetRepository.findBySlug(normalizeSlug(slug))
                .orElseThrow(() -> new IllegalArgumentException("Dashboard widget not found"));
        if ("parent".equalsIgnoreCase(panel)) {
            widget.setParentEnabled(enabled);
        } else {
            widget.setStudentEnabled(enabled);
        }
        return toWidgetMap(dashboardWidgetRepository.save(widget));
    }

    private void ensureSettings() {
        if (settingRepository.count() > 0) {
            return;
        }
        AppStudentProfileSetting settings = new AppStudentProfileSetting();
        settings.setAllowEditableFormFields(false);
        settings.setIsActive(true);
        settingRepository.save(settings);
    }

    private AppStudentProfileSetting requireSettings() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() -> {
            ensureSettings();
            return settingRepository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private void syncEditFields() {
        Map<String, AppStudentProfileEditField> existingBySlug = new LinkedHashMap<>();
        for (AppStudentProfileEditField item : editFieldRepository.findAllByOrderBySortOrderAscNameAsc()) {
            existingBySlug.putIfAbsent(item.getSlug(), item);
        }

        Set<String> canonicalSlugs = new HashSet<>();
        for (int i = 0; i < EDIT_FIELDS.length; i++) {
            String[] row = EDIT_FIELDS[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            AppStudentProfileEditField field = existingBySlug.get(slug);
            if (field == null) {
                field = new AppStudentProfileEditField();
                field.setSlug(slug);
                field.setName(row[1]);
                field.setEnabled(Boolean.parseBoolean(row[2]));
                field.setSortOrder(i + 1);
                field.setIsActive(true);
                editFieldRepository.save(field);
            } else {
                field.setName(row[1]);
                field.setSortOrder(i + 1);
                if (field.getEnabled() == null) {
                    field.setEnabled(Boolean.parseBoolean(row[2]));
                }
                editFieldRepository.save(field);
            }
        }

        for (AppStudentProfileEditField item : existingBySlug.values()) {
            if (!canonicalSlugs.contains(item.getSlug())) {
                editFieldRepository.deleteById(item.getId());
            }
        }
    }

    private void syncDashboardWidgets() {
        Map<String, AppStudentDashboardWidget> existingBySlug = new LinkedHashMap<>();
        for (AppStudentDashboardWidget item : dashboardWidgetRepository.findAllByOrderBySortOrderAscNameAsc()) {
            existingBySlug.putIfAbsent(item.getSlug(), item);
        }

        Set<String> canonicalSlugs = new HashSet<>();
        for (int i = 0; i < DASHBOARD_WIDGETS.length; i++) {
            String[] row = DASHBOARD_WIDGETS[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            AppStudentDashboardWidget widget = existingBySlug.get(slug);
            if (widget == null) {
                widget = new AppStudentDashboardWidget();
                widget.setSlug(slug);
                widget.setName(row[1]);
                widget.setStudentEnabled(Boolean.parseBoolean(row[2]));
                widget.setParentEnabled(Boolean.parseBoolean(row[3]));
                widget.setSortOrder(i + 1);
                widget.setIsActive(true);
                dashboardWidgetRepository.save(widget);
            } else {
                widget.setName(row[1]);
                widget.setSortOrder(i + 1);
                if (widget.getStudentEnabled() == null) {
                    widget.setStudentEnabled(Boolean.parseBoolean(row[2]));
                }
                if (widget.getParentEnabled() == null) {
                    widget.setParentEnabled(Boolean.parseBoolean(row[3]));
                }
                dashboardWidgetRepository.save(widget);
            }
        }

        for (AppStudentDashboardWidget item : existingBySlug.values()) {
            if (!canonicalSlugs.contains(item.getSlug())) {
                dashboardWidgetRepository.deleteById(item.getId());
            }
        }
    }

    private Map<String, Object> toEditFieldMap(AppStudentProfileEditField field) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", field.getId());
        map.put("slug", field.getSlug());
        map.put("name", field.getName());
        map.put("enabled", Boolean.TRUE.equals(field.getEnabled()));
        map.put("sortOrder", field.getSortOrder());
        return map;
    }

    private Map<String, Object> toWidgetMap(AppStudentDashboardWidget widget) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", widget.getId());
        map.put("slug", widget.getSlug());
        map.put("name", widget.getName());
        map.put("studentEnabled", Boolean.TRUE.equals(widget.getStudentEnabled()));
        map.put("parentEnabled", Boolean.TRUE.equals(widget.getParentEnabled()));
        map.put("sortOrder", widget.getSortOrder());
        return map;
    }

    private String normalizeSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("Field slug is required");
        }
        return slug.trim();
    }
}
