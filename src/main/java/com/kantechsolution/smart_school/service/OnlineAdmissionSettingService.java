package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.AppCustomField;
import com.kantechsolution.smart_school.model.AppOnlineAdmissionField;
import com.kantechsolution.smart_school.model.AppOnlineAdmissionSetting;
import com.kantechsolution.smart_school.repository.AppCustomFieldRepository;
import com.kantechsolution.smart_school.repository.AppOnlineAdmissionFieldRepository;
import com.kantechsolution.smart_school.repository.AppOnlineAdmissionSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Order(44)
public class OnlineAdmissionSettingService implements ApplicationRunner {

    private static final String FIELD_SOURCE_SYSTEM = "SYSTEM";
    private static final String FIELD_SOURCE_CUSTOM = "CUSTOM";

    private static final String DEFAULT_INSTRUCTIONS = """
            <p><strong>General Instruction:-</strong> These instructions pertain to online application for admission to Mount Carmel School for the academic year 2025-26. In the remainder of these instructions, a "Mount Carmel School".</p>
            <ol>
            <li>To fill online admission form, Basic Details like as ( Class, First Name, Last Name, Gender, Date of Birth, Mobile Number, Email) etc.</li>
            <li>Filling in admission application form and uploading documents and then click on the Submit button.</li>
            <li>After submitting form, this will redirect you in Online Admission Review Details page where you can check your details what you have filled previously.</li>
            </ol>""";

    private static final String DEFAULT_TERMS = """
            <p><strong>General Terms &amp; Conditions for Students:-</strong></p>
            <ol>
            <li>The purpose of portal is to present the most up-to-date and accurate information regarding academic records.</li>
            <li>I do hereby declare that all particulars furnished above are true to the best of my knowledge and belief.</li>
            </ol>""";

    private static final String[][] SYSTEM_FIELDS = {
            {"class", "Class", "true"},
            {"section", "Section", "true"},
            {"first_name", "First Name", "true"},
            {"last_name", "Last Name", "true"},
            {"category", "Category", "true"},
            {"religion", "Religion", "true"},
            {"cast", "Caste", "true"},
            {"gender", "Gender", "true"},
            {"date_of_birth", "Date Of Birth", "true"},
            {"mobile_number", "Mobile Number", "true"},
            {"email", "Email", "true"},
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
            {"guardian_is", "If Guardian Is", "true"},
            {"guardian_name", "Guardian Name", "true"},
            {"guardian_relation", "Guardian Relation", "true"},
            {"guardian_phone", "Guardian Phone", "true"},
            {"guardian_email", "Guardian Email", "true"},
            {"guardian_occupation", "Guardian Occupation", "true"},
            {"guardian_pic", "Guardian Photo", "true"},
            {"guardian_address", "Guardian Address", "true"},
            {"guardian_address_is_current", "If Guardian Address Is Current Address", "true"},
            {"current_address", "Current Address", "true"},
            {"permanent_address_is_current", "If Permanent Address Is Current Address", "true"},
            {"permanent_address", "Permanent Address", "true"},
            {"bank_account_no", "Bank Account Number", "true"},
            {"bank_name", "Bank Name", "true"},
            {"ifsc_code", "IFSC Code", "true"},
            {"national_id", "National Identification Number", "true"},
            {"local_id", "Local Identification Number", "true"},
            {"rte", "RTE", "true"},
            {"previous_school_details", "Previous School Details", "true"},
            {"student_note", "Note", "true"},
            {"upload_documents", "Upload Documents", "true"},
            {"medical_history", "Medical History", "true"}
    };

    private final AppOnlineAdmissionSettingRepository settingRepository;
    private final AppOnlineAdmissionFieldRepository fieldRepository;
    private final AppCustomFieldRepository customFieldRepository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureSettings();
        syncSystemFields();
        syncCustomFields();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFormSettings() {
        AppOnlineAdmissionSetting settings = requireSettings();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("onlineAdmissionEnabled", Boolean.TRUE.equals(settings.getOnlineAdmissionEnabled()));
        map.put("paymentOptionEnabled", Boolean.TRUE.equals(settings.getPaymentOptionEnabled()));
        map.put("formFees", settings.getFormFees() == null ? "100.00" : settings.getFormFees().toPlainString());
        map.put("applicationFormPath", settings.getApplicationFormPath());
        map.put("applicationFormName", settings.getApplicationFormName());
        map.put("instructions", settings.getInstructions());
        map.put("termsConditions", settings.getTermsConditions());
        return map;
    }

    @Transactional
    public Map<String, Object> saveFormSettings(Map<String, String> payload, MultipartFile applicationForm) {
        AppOnlineAdmissionSetting settings = requireSettings();
        settings.setOnlineAdmissionEnabled(parseBoolean(payload.get("onlineAdmissionEnabled"), true));
        settings.setPaymentOptionEnabled(parseBoolean(payload.get("paymentOptionEnabled"), true));
        settings.setFormFees(parseFees(payload.get("formFees")));
        settings.setInstructions(payload.get("instructions"));
        settings.setTermsConditions(payload.get("termsConditions"));

        if (applicationForm != null && !applicationForm.isEmpty()) {
            StoredFile storedFile = storeApplicationForm(applicationForm);
            deleteStoredFile(settings.getApplicationFormPath());
            settings.setApplicationFormPath(storedFile.path());
            settings.setApplicationFormName(storedFile.originalName());
        }

        settingRepository.save(settings);
        return getFormSettings();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listFields() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (AppOnlineAdmissionField field : fieldRepository.findAllByOrderBySortOrderAscNameAsc()) {
            rows.add(toFieldMap(field));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> setFieldEnabled(String slug, boolean enabled) {
        AppOnlineAdmissionField field = fieldRepository.findBySlug(normalizeSlug(slug))
                .orElseThrow(() -> new IllegalArgumentException("Online admission field not found"));
        field.setEnabled(enabled);
        return toFieldMap(fieldRepository.save(field));
    }

    private void ensureSettings() {
        if (settingRepository.count() > 0) {
            return;
        }
        AppOnlineAdmissionSetting settings = new AppOnlineAdmissionSetting();
        settings.setOnlineAdmissionEnabled(true);
        settings.setPaymentOptionEnabled(true);
        settings.setFormFees(new BigDecimal("100.00"));
        settings.setInstructions(DEFAULT_INSTRUCTIONS);
        settings.setTermsConditions(DEFAULT_TERMS);
        settings.setIsActive(true);
        settingRepository.save(settings);
    }

    private AppOnlineAdmissionSetting requireSettings() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() -> {
            ensureSettings();
            return settingRepository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private void syncSystemFields() {
        Map<String, AppOnlineAdmissionField> existingBySlug = new LinkedHashMap<>();
        for (AppOnlineAdmissionField item : fieldRepository.findAllByOrderBySortOrderAscNameAsc()) {
            if (FIELD_SOURCE_SYSTEM.equalsIgnoreCase(item.getFieldSource())) {
                existingBySlug.putIfAbsent(item.getSlug(), item);
            }
        }

        Set<String> canonicalSlugs = new HashSet<>();
        for (int i = 0; i < SYSTEM_FIELDS.length; i++) {
            String[] row = SYSTEM_FIELDS[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            AppOnlineAdmissionField field = existingBySlug.get(slug);
            if (field == null) {
                field = new AppOnlineAdmissionField();
                field.setSlug(slug);
                field.setName(row[1]);
                field.setFieldSource(FIELD_SOURCE_SYSTEM);
                field.setEnabled(Boolean.parseBoolean(row[2]));
                field.setSortOrder(i + 1);
                field.setIsActive(true);
                fieldRepository.save(field);
            } else {
                field.setName(row[1]);
                field.setSortOrder(i + 1);
                if (field.getEnabled() == null) {
                    field.setEnabled(Boolean.parseBoolean(row[2]));
                }
                fieldRepository.save(field);
            }
        }

        for (AppOnlineAdmissionField item : existingBySlug.values()) {
            if (!canonicalSlugs.contains(item.getSlug())) {
                fieldRepository.deleteById(item.getId());
            }
        }
    }

    private void syncCustomFields() {
        Set<String> systemFieldNames = systemFieldNames();
        List<AppCustomField> customFields = customFieldRepository.findByBelongToOrderByWeightAscNameAsc("students");
        Set<Long> activeCustomIds = new HashSet<>();
        int sortOrder = SYSTEM_FIELDS.length;

        for (AppCustomField customField : customFields) {
            if (systemFieldNames.contains(normalizeFieldName(customField.getName()))) {
                fieldRepository.findByCustomFieldId(customField.getId())
                        .ifPresent(existing -> fieldRepository.deleteById(existing.getId()));
                continue;
            }
            activeCustomIds.add(customField.getId());
            sortOrder++;
            AppOnlineAdmissionField field = fieldRepository.findByCustomFieldId(customField.getId()).orElse(null);
            if (field == null) {
                field = new AppOnlineAdmissionField();
                field.setSlug("custom_" + customField.getId());
                field.setName(customField.getName());
                field.setFieldSource(FIELD_SOURCE_CUSTOM);
                field.setCustomFieldId(customField.getId());
                field.setEnabled(false);
                field.setSortOrder(sortOrder);
                field.setIsActive(true);
                fieldRepository.save(field);
            } else {
                field.setName(customField.getName());
                field.setSortOrder(sortOrder);
                fieldRepository.save(field);
            }
        }

        for (AppOnlineAdmissionField item : fieldRepository.findAllByOrderBySortOrderAscNameAsc()) {
            if (FIELD_SOURCE_CUSTOM.equalsIgnoreCase(item.getFieldSource())
                    && item.getCustomFieldId() != null
                    && !activeCustomIds.contains(item.getCustomFieldId())) {
                fieldRepository.deleteById(item.getId());
            }
        }
    }

    private Set<String> systemFieldNames() {
        Set<String> names = new HashSet<>();
        for (String[] row : SYSTEM_FIELDS) {
            names.add(normalizeFieldName(row[1]));
        }
        return names;
    }

    private String normalizeFieldName(String name) {
        return name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
    }

    private Map<String, Object> toFieldMap(AppOnlineAdmissionField field) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", field.getId());
        map.put("slug", field.getSlug());
        map.put("name", field.getName());
        map.put("fieldSource", field.getFieldSource());
        map.put("customFieldId", field.getCustomFieldId());
        map.put("enabled", Boolean.TRUE.equals(field.getEnabled()));
        map.put("sortOrder", field.getSortOrder());
        return map;
    }

    private StoredFile storeApplicationForm(MultipartFile file) {
        try {
            Path directory = uploadStorage.getOnlineAdmissionDir();
            String extension = extractExtension(file.getOriginalFilename());
            String filename = "application-form-" + UUID.randomUUID() + extension;
            Path target = directory.resolve(filename);
            Files.copy(file.getInputStream(), target);
            return new StoredFile("/uploads/online-admission/" + filename, file.getOriginalFilename());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to upload admission application form", e);
        }
    }

    private void deleteStoredFile(String path) {
        if (path == null || path.isBlank()) {
            return;
        }
        try {
            String filename = path.substring(path.lastIndexOf('/') + 1);
            Path target = uploadStorage.getOnlineAdmissionDir().resolve(filename);
            Files.deleteIfExists(target);
        } catch (Exception ignored) {
            // Ignore cleanup failures for stale files.
        }
    }

    private BigDecimal parseFees(String value) {
        if (value == null || value.isBlank()) {
            return new BigDecimal("0.00");
        }
        try {
            return new BigDecimal(value.trim()).setScale(2, java.math.RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Online Admission Form Fees must be a valid number");
        }
    }

    private boolean parseBoolean(String value, boolean defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return "true".equalsIgnoreCase(value.trim())
                || "1".equals(value.trim())
                || "yes".equalsIgnoreCase(value.trim())
                || "on".equalsIgnoreCase(value.trim());
    }

    private String normalizeSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("Field slug is required");
        }
        return slug.trim();
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    private record StoredFile(String path, String originalName) {
    }
}
