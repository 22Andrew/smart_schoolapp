package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolGeneralSetting;
import com.kantechsolution.smart_school.repository.SchoolGeneralSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(3)
public class SchoolGeneralSettingService implements ApplicationRunner {

    private final SchoolGeneralSettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedDefaults();
    }

    @Transactional
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFormOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("sessions", List.of("2023-24", "2024-25", "2025-26", "2026-27", "2027-28"));
        options.put("sessionStartMonths", List.of(
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        ));
        options.put("dateFormats", List.of("mm/dd/yyyy", "dd/mm/yyyy", "yyyy-mm-dd", "dd-mm-yyyy", "mm-dd-yyyy"));
        options.put("timezones", List.of(
                "(GMT+05:30) Asia, Kolkata",
                "(GMT+00:00) UTC",
                "(GMT-05:00) America, New York",
                "(GMT+01:00) Europe, London",
                "(GMT+04:00) Asia, Dubai"
        ));
        options.put("startDaysOfWeek", List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"));
        options.put("currencyFormats", List.of(
                "1,23,45,678.00",
                "12,345,678.00",
                "12345678.00",
                "12.345.678,00"
        ));
        return options;
    }

    @Transactional
    public void updateSession(String sessionName) {
        SchoolGeneralSetting settings = requireSettings();
        settings.setSession(requiredText(sessionName, "Session"));
        repository.save(settings);
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        SchoolGeneralSetting settings = requireSettings();
        settings.setSchoolName(requiredText(payload.get("schoolName"), "School name"));
        settings.setSchoolCode(text(payload.get("schoolCode")));
        settings.setAddress(requiredText(payload.get("address"), "Address"));
        settings.setPhone(requiredText(payload.get("phone"), "Phone"));
        settings.setEmail(requiredText(payload.get("email"), "Email"));
        settings.setSession(requiredText(payload.get("session"), "Session"));
        settings.setSessionStartMonth(requiredText(payload.get("sessionStartMonth"), "Session start month"));
        settings.setDateFormat(requiredText(payload.get("dateFormat"), "Date format"));
        settings.setTimezone(requiredText(payload.get("timezone"), "Timezone"));
        settings.setStartDayOfWeek(requiredText(payload.get("startDayOfWeek"), "Start day of week"));
        settings.setCurrencyFormat(requiredText(payload.get("currencyFormat"), "Currency format"));
        settings.setBaseUrl(requiredText(payload.get("baseUrl"), "Base URL"));
        settings.setFileUploadPath(requiredText(payload.get("fileUploadPath"), "File upload path"));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        if (repository.count() > 0) {
            return;
        }
        SchoolGeneralSetting settings = SchoolGeneralSetting.builder()
                .schoolName("Mount Carmel School")
                .schoolCode("ACT-487438")
                .address("25 Kings Street, CA")
                .phone("89562423934")
                .email("mountcarmelmailtest@gmail.com")
                .session("2026-27")
                .sessionStartMonth("April")
                .dateFormat("mm/dd/yyyy")
                .timezone("(GMT+05:30) Asia, Kolkata")
                .startDayOfWeek("Monday")
                .currencyFormat("1,23,45,678.00")
                .baseUrl("https://demo.smart-school.in/")
                .fileUploadPath("/var/www/demo.smart-school.in/public_html/uploads/")
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolGeneralSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolGeneralSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("schoolName", settings.getSchoolName());
        map.put("schoolCode", blank(settings.getSchoolCode()));
        map.put("address", settings.getAddress());
        map.put("phone", settings.getPhone());
        map.put("email", settings.getEmail());
        map.put("session", settings.getSession());
        map.put("sessionStartMonth", settings.getSessionStartMonth());
        map.put("dateFormat", settings.getDateFormat());
        map.put("timezone", settings.getTimezone());
        map.put("startDayOfWeek", settings.getStartDayOfWeek());
        map.put("currencyFormat", settings.getCurrencyFormat());
        map.put("baseUrl", settings.getBaseUrl());
        map.put("fileUploadPath", settings.getFileUploadPath());
        return map;
    }

    private String requiredText(Object value, String label) {
        String text = text(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return text;
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
