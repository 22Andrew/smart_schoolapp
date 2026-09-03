package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolIdAutoGenerationSetting;
import com.kantechsolution.smart_school.repository.SchoolIdAutoGenerationSettingRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Predicate;

@Service
@RequiredArgsConstructor
public class SchoolIdAutoGenerationSettingService implements ApplicationRunner {

    private static final List<Integer> DIGIT_OPTIONS = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

    private final SchoolIdAutoGenerationSettingRepository repository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedDefaults();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        Map<String, Object> map = toMap(requireSettings());
        map.put("digitOptions", DIGIT_OPTIONS);
        return map;
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        SchoolIdAutoGenerationSetting settings = requireSettings();
        settings.setAutoAdmissionNo(boolValue(payload.get("autoAdmissionNo"), false));
        settings.setAdmissionNoPrefix(text(payload.get("admissionNoPrefix")));
        settings.setAdmissionNoDigit(digitValue(payload.get("admissionNoDigit")));
        settings.setAdmissionStartFrom(text(payload.get("admissionStartFrom")));
        settings.setAutoStaffId(boolValue(payload.get("autoStaffId"), false));
        settings.setStaffIdPrefix(text(payload.get("staffIdPrefix")));
        settings.setStaffNoDigit(digitValue(payload.get("staffNoDigit")));
        settings.setStaffIdStartFrom(text(payload.get("staffIdStartFrom")));
        Map<String, Object> map = toMap(repository.save(settings));
        map.put("digitOptions", DIGIT_OPTIONS);
        return map;
    }

    @Transactional(readOnly = true)
    public boolean isAutoAdmissionNoEnabled() {
        SchoolIdAutoGenerationSetting settings = requireSettings();
        return Boolean.TRUE.equals(settings.getAutoAdmissionNo());
    }

    @Transactional(readOnly = true)
    public boolean isAutoStaffIdEnabled() {
        SchoolIdAutoGenerationSetting settings = requireSettings();
        return Boolean.TRUE.equals(settings.getAutoStaffId());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> previewNextAdmissionNo() {
        Map<String, Object> result = new LinkedHashMap<>();
        SchoolIdAutoGenerationSetting settings = requireSettings();
        boolean enabled = Boolean.TRUE.equals(settings.getAutoAdmissionNo());
        result.put("autoEnabled", enabled);
        if (enabled) {
            result.put("nextId", computeNextAdmissionNo(settings));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> previewNextStaffId() {
        Map<String, Object> result = new LinkedHashMap<>();
        SchoolIdAutoGenerationSetting settings = requireSettings();
        boolean enabled = Boolean.TRUE.equals(settings.getAutoStaffId());
        result.put("autoEnabled", enabled);
        if (enabled) {
            result.put("nextId", computeNextStaffId(settings));
        }
        return result;
    }

    @Transactional
    public synchronized String generateNextAdmissionNo() {
        SchoolIdAutoGenerationSetting settings = requireSettings();
        if (!Boolean.TRUE.equals(settings.getAutoAdmissionNo())) {
            throw new IllegalArgumentException("Auto Admission No is disabled");
        }
        String prefix = requiredPrefix(settings.getAdmissionNoPrefix(), "Admission No. Prefix");
        int digits = requiredDigits(settings.getAdmissionNoDigit(), "Admission No. Digit");
        String startFrom = requiredStartFrom(settings.getAdmissionStartFrom(), "Admission Start From");
        return generateUniqueId(
                prefix,
                digits,
                startFrom,
                studentAdmissionRepository.findAdmissionNosByPrefix(prefix),
                studentAdmissionRepository::existsByAdmissionNoIgnoreCase
        );
    }

    @Transactional
    public synchronized String generateNextStaffId() {
        SchoolIdAutoGenerationSetting settings = requireSettings();
        if (!Boolean.TRUE.equals(settings.getAutoStaffId())) {
            throw new IllegalArgumentException("Auto Staff ID is disabled");
        }
        String prefix = requiredPrefix(settings.getStaffIdPrefix(), "Staff ID Prefix");
        int digits = requiredDigits(settings.getStaffNoDigit(), "Staff No. Digit");
        String startFrom = requiredStartFrom(settings.getStaffIdStartFrom(), "Staff ID Start From");
        return generateUniqueId(
                prefix,
                digits,
                startFrom,
                staffMemberRepository.findStaffIdsByPrefix(prefix),
                candidate -> staffMemberRepository.findByStaffId(candidate).isPresent()
        );
    }

    private String computeNextAdmissionNo(SchoolIdAutoGenerationSetting settings) {
        String prefix = blank(settings.getAdmissionNoPrefix());
        int digits = settings.getAdmissionNoDigit() == null ? 1 : settings.getAdmissionNoDigit();
        String startFrom = blank(settings.getAdmissionStartFrom());
        if (startFrom.isBlank()) {
            startFrom = "1";
        }
        return formatNextId(prefix, digits, startFrom, studentAdmissionRepository.findAdmissionNosByPrefix(prefix));
    }

    private String computeNextStaffId(SchoolIdAutoGenerationSetting settings) {
        String prefix = blank(settings.getStaffIdPrefix());
        int digits = settings.getStaffNoDigit() == null ? 1 : settings.getStaffNoDigit();
        String startFrom = blank(settings.getStaffIdStartFrom());
        if (startFrom.isBlank()) {
            startFrom = "1";
        }
        return formatNextId(prefix, digits, startFrom, staffMemberRepository.findStaffIdsByPrefix(prefix));
    }

    private String generateUniqueId(String prefix,
                                    int digits,
                                    String startFrom,
                                    List<String> existingValues,
                                    Predicate<String> existsChecker) {
        long nextNumber = resolveNextNumber(prefix, digits, startFrom, existingValues);
        String candidate;
        do {
            candidate = prefix + formatNumericPart(nextNumber, digits);
            nextNumber++;
        } while (existsChecker.test(candidate));
        return candidate;
    }

    private String formatNextId(String prefix, int digits, String startFrom, List<String> existingValues) {
        long nextNumber = resolveNextNumber(prefix, digits, startFrom, existingValues);
        return prefix + formatNumericPart(nextNumber, digits);
    }

    private long resolveNextNumber(String prefix, int digits, String startFrom, List<String> existingValues) {
        long next = parseStartFrom(startFrom);
        String prefixLower = prefix.toLowerCase(Locale.ROOT);
        for (String existing : existingValues) {
            if (existing == null || existing.isBlank()) {
                continue;
            }
            String trimmed = existing.trim();
            if (!prefix.isEmpty() && !trimmed.toLowerCase(Locale.ROOT).startsWith(prefixLower)) {
                continue;
            }
            String suffix = prefix.isEmpty() ? trimmed : trimmed.substring(prefix.length());
            if (!suffix.matches("\\d+")) {
                continue;
            }
            try {
                long value = Long.parseLong(suffix);
                next = Math.max(next, value + 1);
            } catch (NumberFormatException ignored) {
                // skip malformed values
            }
        }
        return next;
    }

    private String formatNumericPart(long value, int digits) {
        return String.format(Locale.ROOT, "%0" + digits + "d", value);
    }

    private long parseStartFrom(String startFrom) {
        String text = startFrom == null ? "" : startFrom.trim();
        if (text.isEmpty()) {
            return 1L;
        }
        if (!text.matches("\\d+")) {
            throw new IllegalArgumentException("Start From must be a valid number");
        }
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Start From must be a valid number");
        }
    }

    private String requiredPrefix(String prefix, String fieldName) {
        String value = blank(prefix).trim();
        if (value.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required when auto generation is enabled");
        }
        return value;
    }

    private int requiredDigits(Integer digits, String fieldName) {
        if (digits == null || !DIGIT_OPTIONS.contains(digits)) {
            throw new IllegalArgumentException(fieldName + " is required when auto generation is enabled");
        }
        return digits;
    }

    private String requiredStartFrom(String startFrom, String fieldName) {
        String value = blank(startFrom).trim();
        if (value.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required when auto generation is enabled");
        }
        parseStartFrom(value);
        return value;
    }

    private void seedDefaults() {
        SchoolIdAutoGenerationSetting settings = SchoolIdAutoGenerationSetting.builder()
                .autoAdmissionNo(false)
                .admissionNoPrefix("")
                .admissionNoDigit(null)
                .admissionStartFrom("")
                .autoStaffId(false)
                .staffIdPrefix("")
                .staffNoDigit(null)
                .staffIdStartFrom("")
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolIdAutoGenerationSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolIdAutoGenerationSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("autoAdmissionNo", settings.getAutoAdmissionNo());
        map.put("admissionNoPrefix", blank(settings.getAdmissionNoPrefix()));
        map.put("admissionNoDigit", settings.getAdmissionNoDigit());
        map.put("admissionStartFrom", blank(settings.getAdmissionStartFrom()));
        map.put("autoStaffId", settings.getAutoStaffId());
        map.put("staffIdPrefix", blank(settings.getStaffIdPrefix()));
        map.put("staffNoDigit", settings.getStaffNoDigit());
        map.put("staffIdStartFrom", blank(settings.getStaffIdStartFrom()));
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

    private Integer digitValue(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            int digit = Integer.parseInt(value.toString().trim());
            if (!DIGIT_OPTIONS.contains(digit)) {
                throw new IllegalArgumentException("Digit must be between 1 and 10");
            }
            return digit;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Digit must be a valid number");
        }
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
