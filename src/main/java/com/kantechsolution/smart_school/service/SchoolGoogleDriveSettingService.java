package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolGoogleDriveSetting;
import com.kantechsolution.smart_school.repository.SchoolGoogleDriveSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolGoogleDriveSettingService implements ApplicationRunner {

    private final SchoolGoogleDriveSettingRepository repository;

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
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        SchoolGoogleDriveSetting settings = requireSettings();
        settings.setClientId(requiredText(payload.get("clientId"), "Client ID"));
        settings.setApiKey(requiredText(payload.get("apiKey"), "API Key"));
        settings.setProjectNumberAppId(requiredText(payload.get("projectNumberAppId"), "Project Number/APP ID"));
        settings.setStatus(boolValue(payload.get("status"), true));
        settings.setAllowStudentUpload(boolValue(payload.get("allowStudentUpload"), true));
        settings.setAllowGuardianUpload(boolValue(payload.get("allowGuardianUpload"), true));
        settings.setAllowStaffUpload(boolValue(payload.get("allowStaffUpload"), true));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolGoogleDriveSetting settings = SchoolGoogleDriveSetting.builder()
                .clientId("98759700250-jm559g6drk93nhlgjvdboqa0t3aafnpa.apps.googleusercontent.com")
                .apiKey("AlzaSyClXdi9Qotn1yBacouZ8Z6KxrFbvOzdC9w")
                .projectNumberAppId("98759700250")
                .status(true)
                .allowStudentUpload(true)
                .allowGuardianUpload(true)
                .allowStaffUpload(true)
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolGoogleDriveSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolGoogleDriveSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("clientId", blank(settings.getClientId()));
        map.put("apiKey", blank(settings.getApiKey()));
        map.put("projectNumberAppId", blank(settings.getProjectNumberAppId()));
        map.put("status", settings.getStatus());
        map.put("allowStudentUpload", settings.getAllowStudentUpload());
        map.put("allowGuardianUpload", settings.getAllowGuardianUpload());
        map.put("allowStaffUpload", settings.getAllowStaffUpload());
        return map;
    }

    private String requiredText(Object value, String fieldName) {
        String text = text(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return text;
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

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
