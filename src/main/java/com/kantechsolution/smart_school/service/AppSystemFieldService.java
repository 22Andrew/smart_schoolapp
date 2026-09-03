package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppSystemField;
import com.kantechsolution.smart_school.repository.AppSystemFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Order(42)
public class AppSystemFieldService implements ApplicationRunner {

    private static final String TYPE_STUDENT = "STUDENT";
    private static final String TYPE_STAFF = "STAFF";

    /** Matches demo Student tab: https://demo.smart-school.in/admin/systemfield */
    private static final String[][] STUDENT_FIELDS = {
            {"roll_no", "Roll Number", "true"},
            {"middlename", "Middle Name", "false"},
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

    /** Matches demo Staff tab: https://demo.smart-school.in/admin/systemfield */
    private static final String[][] STAFF_FIELDS = {
            {"staff_designation", "Designation", "true"},
            {"staff_department", "Department", "true"},
            {"staff_last_name", "Last Name", "true"},
            {"staff_father_name", "Father Name", "true"},
            {"staff_mother_name", "Mother Name", "true"},
            {"staff_date_of_joining", "Date Of Joining", "true"},
            {"staff_phone", "Phone", "true"},
            {"staff_emergency_contact", "Emergency Contact Number", "true"},
            {"staff_marital_status", "Marital Status", "true"},
            {"staff_photo", "Photo", "true"},
            {"staff_current_address", "Current Address", "true"},
            {"staff_permanent_address", "Permanent Address", "true"},
            {"staff_qualification", "Qualification", "true"},
            {"staff_work_experience", "Work Experience", "false"},
            {"staff_note", "Note", "true"},
            {"staff_epf_no", "EPF No", "false"},
            {"staff_basic_salary", "Basic Salary", "false"},
            {"staff_contract_type", "Contract Type", "false"},
            {"staff_work_shift", "Work Shift", "true"},
            {"staff_work_location", "Work Location", "true"},
            {"staff_leaves", "Leaves", "true"},
            {"staff_account_details", "Bank Account Details", "true"},
            {"staff_social_media", "Social Media", "true"},
            {"staff_upload_documents", "Upload Documents", "true"}
    };

    private final AppSystemFieldRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        syncFields(TYPE_STUDENT, STUDENT_FIELDS);
        syncFields(TYPE_STAFF, STAFF_FIELDS);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listByType(String type) {
        return repository.findByFieldTypeOrderBySortOrderAscNameAsc(normalizeType(type)).stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> setEnabled(String type, String slug, boolean enabled) {
        AppSystemField field = repository.findByFieldTypeAndSlug(normalizeType(type), normalizeSlug(slug))
                .orElseThrow(() -> new IllegalArgumentException("System field not found"));
        field.setEnabled(enabled);
        return toMap(repository.save(field));
    }

    private void syncFields(String fieldType, String[][] defaults) {
        Map<String, AppSystemField> existingBySlug = new LinkedHashMap<>();
        repository.findByFieldTypeOrderBySortOrderAscNameAsc(fieldType)
                .forEach(item -> existingBySlug.putIfAbsent(item.getSlug(), item));

        Set<String> canonicalSlugs = new HashSet<>();
        for (int i = 0; i < defaults.length; i++) {
            String[] row = defaults[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            AppSystemField field = existingBySlug.get(slug);
            if (field == null) {
                field = AppSystemField.builder()
                        .fieldType(fieldType)
                        .slug(slug)
                        .name(row[1])
                        .enabled(Boolean.parseBoolean(row[2]))
                        .sortOrder(i + 1)
                        .build();
                field.setIsActive(true);
                repository.save(field);
            } else {
                field.setName(row[1]);
                field.setSortOrder(i + 1);
                if (field.getEnabled() == null) {
                    field.setEnabled(Boolean.parseBoolean(row[2]));
                }
                repository.save(field);
            }
        }

        existingBySlug.values().stream()
                .filter(item -> !canonicalSlugs.contains(item.getSlug()))
                .forEach(item -> repository.deleteById(item.getId()));
    }

    private Map<String, Object> toMap(AppSystemField field) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", field.getId());
        map.put("slug", field.getSlug());
        map.put("role", field.getSlug());
        map.put("name", field.getName());
        map.put("enabled", Boolean.TRUE.equals(field.getEnabled()));
        map.put("sortOrder", field.getSortOrder());
        map.put("type", field.getFieldType().toLowerCase(Locale.ROOT));
        return map;
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return TYPE_STUDENT;
        }
        String normalized = type.trim().toUpperCase(Locale.ROOT);
        if ("STAFF".equals(normalized)) {
            return TYPE_STAFF;
        }
        return TYPE_STUDENT;
    }

    private String normalizeSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("System field role is required");
        }
        return slug.trim();
    }
}
