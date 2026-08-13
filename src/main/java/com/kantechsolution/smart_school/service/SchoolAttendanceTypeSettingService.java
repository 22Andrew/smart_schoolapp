package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolAttendanceRule;
import com.kantechsolution.smart_school.model.SchoolAttendanceTypeSetting;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.model.SchoolClassAttendanceTime;
import com.kantechsolution.smart_school.repository.SchoolAttendanceRuleRepository;
import com.kantechsolution.smart_school.repository.SchoolAttendanceTypeSettingRepository;
import com.kantechsolution.smart_school.repository.SchoolClassAttendanceTimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolAttendanceTypeSettingService implements ApplicationRunner {

    public static final List<String> STAFF_ROLES = List.of(
            "Admin", "Teacher", "Accountant", "Librarian", "Receptionist", "Super Admin"
    );

    public static final List<Map<String, String>> RULE_TYPE_OPTIONS = List.of(
            mapOf("code", "P", "label", "Present (P)"),
            mapOf("code", "L", "label", "Late (L)"),
            mapOf("code", "F", "label", "Half Day (F)"),
            mapOf("code", "SH", "label", "Half Day (Second Half) (SH)")
    );

    private static final List<String> RULE_CODES = List.of("P", "L", "F", "SH");
    private static final List<String> STUDENT_RULE_CODES = List.of("P", "L", "F");

    private final SchoolAttendanceTypeSettingRepository settingsRepository;
    private final SchoolClassAttendanceTimeRepository classTimeRepository;
    private final SchoolAttendanceRuleRepository ruleRepository;
    private final SchoolClassService schoolClassService;
    private final JdbcTemplate jdbcTemplate;

    private static final String ATTENDANCE_RULE_UNIQUE_INDEX = "uk_attendance_rule";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        migrateAttendanceRuleConstraints();
        migrateAttendanceRules();
        if (settingsRepository.count() == 0) {
            seedGeneralSettings();
        }
        if (ruleRepository.count() == 0) {
            seedDefaultRules();
        } else {
            cleanupLegacyStudentRules();
            seedStudentRulesForClasses();
        }
        syncClassAttendanceTimes();
    }

    @Transactional
    protected void migrateAttendanceRuleConstraints() {
        List<String> uniqueIndexes = jdbcTemplate.queryForList("""
                SELECT DISTINCT INDEX_NAME
                FROM information_schema.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'school_attendance_rules'
                  AND NON_UNIQUE = 0
                  AND INDEX_NAME <> 'PRIMARY'
                """, String.class);

        for (String indexName : uniqueIndexes) {
            if (ATTENDANCE_RULE_UNIQUE_INDEX.equalsIgnoreCase(indexName)) {
                continue;
            }
            try {
                jdbcTemplate.execute("ALTER TABLE school_attendance_rules DROP INDEX `" + indexName + "`");
            } catch (Exception ignored) {
                // Index may already have been removed manually.
            }
        }

        boolean hasTargetIndex = !jdbcTemplate.queryForList("""
                SELECT DISTINCT INDEX_NAME
                FROM information_schema.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'school_attendance_rules'
                  AND INDEX_NAME = ?
                """, String.class, ATTENDANCE_RULE_UNIQUE_INDEX).isEmpty();

        if (!hasTargetIndex) {
            jdbcTemplate.execute("""
                    ALTER TABLE school_attendance_rules
                    ADD UNIQUE INDEX uk_attendance_rule (audience, role_name, class_id, section, rule_type)
                    """);
        }
    }

    @Transactional
    protected void migrateAttendanceRules() {
        ruleRepository.normalizeNullClassIds();
        ruleRepository.normalizeNullSections();
    }

    @Transactional
    protected void cleanupLegacyStudentRules() {
        ruleRepository.deleteByAudienceAndClassId("student", SchoolAttendanceRule.STAFF_CLASS_ID);
        ruleRepository.deleteLegacyStudentRules();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAllSettings() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("general", getGeneralSettings());
        result.put("classTimes", getClassTimes());
        result.put("staffRules", getStaffRules());
        result.put("studentRules", getStudentRules());
        result.put("staffRoles", STAFF_ROLES);
        result.put("ruleTypes", RULE_TYPE_OPTIONS);
        result.put("studentRuleTypes", STUDENT_RULE_CODES.stream()
                .map(code -> mapOf("code", code, "label", studentRuleLabel(code)))
                .toList());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGeneralSettings() {
        return toGeneralMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveGeneralSettings(Map<String, Object> payload) {
        SchoolAttendanceTypeSetting settings = requireSettings();
        String mode = text(payload.get("attendanceMode"));
        if (!mode.equals("day_wise") && !mode.equals("period_wise")) {
            throw new IllegalArgumentException("Attendance mode must be Day Wise or Period Wise");
        }
        settings.setAttendanceMode(mode);
        settings.setQrBarcodeBiometricEnabled(boolValue(payload.get("qrBarcodeBiometricEnabled"), false));
        settings.setDevices(text(payload.get("devices")));
        settings.setLowAttendanceLimit(doubleValue(payload.get("lowAttendanceLimit"), 75.0));
        return toGeneralMap(settingsRepository.save(settings));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClassTimes() {
        List<SchoolClass> classes = schoolClassService.getAllClasses();
        Map<String, SchoolClassAttendanceTime> existing = classTimeRepository.findAllByOrderByClassIdAscSectionAsc()
                .stream()
                .collect(Collectors.toMap(
                        row -> row.getClassId() + ":" + row.getSection().toUpperCase(Locale.ROOT),
                        row -> row,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (SchoolClass schoolClass : classes) {
            List<String> sections = schoolClass.getSections() == null ? List.of() : schoolClass.getSections();
            for (String section : sections) {
                if (section == null || section.isBlank()) {
                    continue;
                }
                String key = schoolClass.getId() + ":" + section.toUpperCase(Locale.ROOT);
                SchoolClassAttendanceTime row = existing.get(key);
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", row != null ? row.getId() : null);
                map.put("classId", schoolClass.getId());
                map.put("className", schoolClass.getName());
                map.put("section", section);
                map.put("submitTime", row != null ? blank(row.getSubmitTime()) : "");
                rows.add(map);
            }
        }
        return rows;
    }

    @Transactional
    public List<Map<String, Object>> saveClassTimes(List<Map<String, Object>> items) {
        if (items == null) {
            throw new IllegalArgumentException("Class attendance times are required");
        }
        syncClassAttendanceTimes();
        Map<String, SchoolClassAttendanceTime> existing = classTimeRepository.findAllByOrderByClassIdAscSectionAsc()
                .stream()
                .collect(Collectors.toMap(
                        row -> row.getClassId() + ":" + row.getSection().toUpperCase(Locale.ROOT),
                        row -> row,
                        (a, b) -> a
                ));

        for (Map<String, Object> item : items) {
            Long classId = longValue(item.get("classId"));
            String section = text(item.get("section")).toUpperCase(Locale.ROOT);
            if (classId == null || section.isBlank()) {
                continue;
            }
            String submitTime = text(item.get("submitTime"));
            String key = classId + ":" + section;
            SchoolClassAttendanceTime row = existing.get(key);
            if (row == null) {
                row = SchoolClassAttendanceTime.builder()
                        .classId(classId)
                        .section(section)
                        .build();
            }
            row.setSubmitTime(submitTime);
            row.setIsActive(true);
            classTimeRepository.save(row);
            existing.put(key, row);
        }
        return getClassTimes();
    }

    @Transactional(readOnly = true)
    public Map<String, List<Map<String, Object>>> getStaffRules() {
        List<SchoolAttendanceRule> rules = ruleRepository
                .findByAudienceAndClassIdOrderByRoleNameAscRuleTypeAsc("staff", SchoolAttendanceRule.STAFF_CLASS_ID);
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();

        for (String role : STAFF_ROLES) {
            grouped.put(role, defaultStaffRules());
        }

        for (SchoolAttendanceRule rule : rules) {
            grouped.computeIfAbsent(rule.getRoleName(), key -> defaultStaffRules());
            applyRuleValues(grouped.get(rule.getRoleName()), rule);
        }
        return grouped;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentRules() {
        List<SchoolClass> classes = schoolClassService.getAllClasses();
        List<Map<String, Object>> classRows = new ArrayList<>();

        for (SchoolClass schoolClass : classes) {
            Map<String, Object> classRow = new LinkedHashMap<>();
            classRow.put("classId", schoolClass.getId());
            classRow.put("className", schoolClass.getName());
            classRow.put("sections", getStudentRulesForClass(schoolClass));
            classRows.add(classRow);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("classes", classRows);
        return result;
    }

    private Map<String, List<Map<String, Object>>> getStudentRulesForClass(SchoolClass schoolClass) {
        List<SchoolAttendanceRule> rules = ruleRepository
                .findByAudienceAndClassIdOrderBySectionAscRuleTypeAsc("student", schoolClass.getId());
        Map<String, List<Map<String, Object>>> sections = new LinkedHashMap<>();
        List<String> sectionNames = schoolClass.getSections() == null ? List.of() : schoolClass.getSections();

        for (String section : sectionNames) {
            if (section == null || section.isBlank()) {
                continue;
            }
            sections.put(section, defaultStudentRules());
        }

        for (SchoolAttendanceRule rule : rules) {
            if (rule.getSection() == null || rule.getSection().isBlank()) {
                continue;
            }
            for (String sectionKey : sections.keySet()) {
                if (sectionKey.equalsIgnoreCase(rule.getSection())) {
                    applyRuleValues(sections.get(sectionKey), rule);
                    break;
                }
            }
        }
        return sections;
    }

    @Transactional
    public Map<String, List<Map<String, Object>>> saveStaffRules(String roleName, List<Map<String, Object>> items) {
        String role = text(roleName);
        if (role.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        if (!STAFF_ROLES.contains(role)) {
            throw new IllegalArgumentException("Invalid staff role: " + role);
        }
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Attendance rules are required");
        }

        ruleRepository.deleteStaffRules("staff", role, SchoolAttendanceRule.STAFF_CLASS_ID);
        saveRuleRows("staff", role, SchoolAttendanceRule.STAFF_CLASS_ID, SchoolAttendanceRule.STAFF_SECTION, items, RULE_CODES);
        return getStaffRules();
    }

    @Transactional
    public Map<String, Object> saveStudentClassRules(Long classId, Map<String, List<Map<String, Object>>> sections) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        SchoolClass schoolClass = schoolClassService.getAllClasses().stream()
                .filter(item -> classId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));
        if (sections == null || sections.isEmpty()) {
            throw new IllegalArgumentException("Section attendance rules are required");
        }

        ruleRepository.deleteByAudienceAndClassId("student", classId);
        for (Map.Entry<String, List<Map<String, Object>>> entry : sections.entrySet()) {
            String section = text(entry.getKey()).toUpperCase(Locale.ROOT);
            if (section.isBlank()) {
                continue;
            }
            validateSection(schoolClass, section);
            saveRuleRows("student", "", classId, section, entry.getValue(), STUDENT_RULE_CODES);
        }
        return getStudentRules();
    }

    @Transactional
    public Map<String, List<Map<String, Object>>> saveRules(String audience, String roleName, List<Map<String, Object>> items) {
        if ("staff".equals(normalizeAudience(audience))) {
            return saveStaffRules(roleName, items);
        }
        throw new IllegalArgumentException("Use the student rules endpoint for student attendance settings");
    }

    private void saveRuleRows(String audience,
                              String roleName,
                              Long classId,
                              String section,
                              List<Map<String, Object>> items,
                              List<String> allowedRuleTypes) {
        for (Map<String, Object> item : items) {
            String ruleType = text(item.get("ruleType")).toUpperCase(Locale.ROOT);
            if (!allowedRuleTypes.contains(ruleType)) {
                throw new IllegalArgumentException("Invalid attendance rule type: " + ruleType);
            }
            SchoolAttendanceRule rule = SchoolAttendanceRule.builder()
                    .audience(audience)
                    .roleName(roleName == null ? "" : roleName)
                    .classId(classId == null ? SchoolAttendanceRule.STAFF_CLASS_ID : classId)
                    .section(section == null ? SchoolAttendanceRule.STAFF_SECTION : section)
                    .ruleType(ruleType)
                    .entryFrom(text(item.get("entryFrom")))
                    .entryUpto(text(item.get("entryUpto")))
                    .totalHour(text(item.get("totalHour")))
                    .build();
            rule.setIsActive(true);
            ruleRepository.save(rule);
        }
    }

    private void validateSection(SchoolClass schoolClass, String section) {
        boolean sectionAllowed = schoolClass.getSections() != null && schoolClass.getSections().stream()
                .anyMatch(value -> value != null && value.equalsIgnoreCase(section));
        if (!sectionAllowed) {
            throw new IllegalArgumentException("Section " + section + " is not available for the selected class");
        }
    }

    private void applyRuleValues(List<Map<String, Object>> rows, SchoolAttendanceRule rule) {
        for (Map<String, Object> row : rows) {
            if (rule.getRuleType().equals(row.get("ruleType"))) {
                row.put("id", rule.getId());
                row.put("entryFrom", blank(rule.getEntryFrom()));
                row.put("entryUpto", blank(rule.getEntryUpto()));
                row.put("totalHour", blank(rule.getTotalHour()));
            }
        }
    }

    private void syncClassAttendanceTimes() {
        List<SchoolClass> classes = schoolClassService.getAllClasses();
        for (SchoolClass schoolClass : classes) {
            List<String> sections = schoolClass.getSections() == null ? List.of() : schoolClass.getSections();
            for (String section : sections) {
                if (section == null || section.isBlank()) {
                    continue;
                }
                boolean exists = classTimeRepository.findAllByOrderByClassIdAscSectionAsc().stream()
                        .anyMatch(row -> schoolClass.getId().equals(row.getClassId())
                                && section.equalsIgnoreCase(row.getSection()));
                if (!exists) {
                    SchoolClassAttendanceTime row = SchoolClassAttendanceTime.builder()
                            .classId(schoolClass.getId())
                            .section(section.toUpperCase(Locale.ROOT))
                            .submitTime("")
                            .build();
                    row.setIsActive(true);
                    classTimeRepository.save(row);
                }
            }
        }
    }

    private void seedGeneralSettings() {
        SchoolAttendanceTypeSetting settings = SchoolAttendanceTypeSetting.builder()
                .attendanceMode("day_wise")
                .qrBarcodeBiometricEnabled(true)
                .devices("1231643032787")
                .lowAttendanceLimit(75.0)
                .build();
        settings.setIsActive(true);
        settingsRepository.save(settings);
    }

    private void seedDefaultRules() {
        for (String role : STAFF_ROLES) {
            boolean exists = ruleRepository
                    .findByAudienceAndClassIdOrderByRoleNameAscRuleTypeAsc("staff", SchoolAttendanceRule.STAFF_CLASS_ID)
                    .stream()
                    .anyMatch(rule -> role.equals(rule.getRoleName()));
            if (!exists) {
                saveRuleRows("staff", role, SchoolAttendanceRule.STAFF_CLASS_ID, SchoolAttendanceRule.STAFF_SECTION,
                        defaultStaffRules(), RULE_CODES);
            }
        }
        seedStudentRulesForClasses();
    }

    private void seedStudentRulesForClasses() {
        for (SchoolClass schoolClass : schoolClassService.getAllClasses()) {
            List<String> sections = schoolClass.getSections() == null ? List.of() : schoolClass.getSections();
            List<SchoolAttendanceRule> existing = ruleRepository
                    .findByAudienceAndClassIdOrderBySectionAscRuleTypeAsc("student", schoolClass.getId());
            for (String section : sections) {
                if (section == null || section.isBlank()) {
                    continue;
                }
                String normalized = section.toUpperCase(Locale.ROOT);
                boolean hasSection = existing.stream()
                        .anyMatch(rule -> normalized.equalsIgnoreCase(rule.getSection()));
                if (!hasSection) {
                    saveRuleRows("student", "", schoolClass.getId(), normalized,
                            defaultStudentRules(), STUDENT_RULE_CODES);
                }
            }
        }
    }

    private List<Map<String, Object>> defaultStaffRules() {
        List<Map<String, Object>> rules = new ArrayList<>();
        rules.add(ruleRow("P", "09:00:00", "09:15:00", "08:00:00"));
        rules.add(ruleRow("L", "09:16:00", "09:30:00", "08:00:00"));
        rules.add(ruleRow("F", "09:31:00", "11:59:00", "04:00:00"));
        rules.add(ruleRow("SH", "12:00:00", "14:00:00", "04:00:00"));
        return rules;
    }

    private List<Map<String, Object>> defaultStudentRules() {
        List<Map<String, Object>> rules = new ArrayList<>();
        rules.add(ruleRow("P", "08:45:00", "09:00:00", "07:00:00"));
        rules.add(ruleRow("L", "09:15:00", "09:30:00", "07:00:00"));
        rules.add(ruleRow("F", "09:30:00", "10:00:00", "04:00:00"));
        return rules;
    }

    private String studentRuleLabel(String code) {
        return switch (code) {
            case "P" -> "Present (P)";
            case "L" -> "Late (L)";
            case "F" -> "Half Day (F)";
            default -> code;
        };
    }

    private Map<String, Object> ruleRow(String type, String from, String upto, String total) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("ruleType", type);
        row.put("entryFrom", from);
        row.put("entryUpto", upto);
        row.put("totalHour", total);
        return row;
    }

    private SchoolAttendanceTypeSetting requireSettings() {
        return settingsRepository.findAll().stream().findFirst().orElseGet(() -> {
            seedGeneralSettings();
            return settingsRepository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toGeneralMap(SchoolAttendanceTypeSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("attendanceMode", blank(settings.getAttendanceMode()));
        map.put("qrBarcodeBiometricEnabled", settings.getQrBarcodeBiometricEnabled());
        map.put("devices", blank(settings.getDevices()));
        map.put("lowAttendanceLimit", settings.getLowAttendanceLimit());
        return map;
    }

    private String normalizeAudience(String audience) {
        String value = text(audience).toLowerCase(Locale.ROOT);
        if (!value.equals("staff") && !value.equals("student")) {
            throw new IllegalArgumentException("Audience must be staff or student");
        }
        return value;
    }

    private static Map<String, String> mapOf(String k1, String v1, String k2, String v2) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        return map;
    }

    private boolean boolValue(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private double doubleValue(Object value, double defaultValue) {
        if (value == null || text(value).isBlank()) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(text(value));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Low Attendance Limit must be a valid number");
        }
    }

    private Long longValue(Object value) {
        if (value == null || text(value).isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(text(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
