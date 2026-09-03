package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolMobileAppSetting;
import com.kantechsolution.smart_school.repository.SchoolMobileAppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolMobileAppSettingService implements ApplicationRunner {

    private final SchoolMobileAppSettingRepository repository;

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
        SchoolMobileAppSetting settings = requireSettings();
        settings.setApiUrl(requiredText(payload.get("apiUrl"), "User Mobile App API URL"));
        settings.setPrimaryColor(requiredColor(payload.get("primaryColor"), "User Mobile App Primary Color Code"));
        settings.setSecondaryColor(requiredColor(payload.get("secondaryColor"), "User Mobile App Secondary Color Code"));
        if (payload.containsKey("fcmServerKey")) {
            settings.setFcmServerKey(text(payload.get("fcmServerKey")));
        }
        return toMap(repository.save(settings));
    }

    @Transactional
    public Map<String, Object> saveRegistration(Map<String, Object> payload) {
        SchoolMobileAppSetting settings = requireSettings();
        settings.setEnvatoPurchaseCode(requiredText(payload.get("envatoPurchaseCode"), "Envato Market Purchase Code"));
        settings.setEnvatoEmail(requiredText(payload.get("envatoEmail"), "Your Email Registered With Envato"));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolMobileAppSetting settings = SchoolMobileAppSetting.builder()
                .apiUrl("https://demo.smart-school.in/api/")
                .primaryColor("#424242")
                .secondaryColor("#E7F1EE")
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolMobileAppSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolMobileAppSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("apiUrl", settings.getApiUrl());
        map.put("primaryColor", settings.getPrimaryColor());
        map.put("secondaryColor", settings.getSecondaryColor());
        map.put("envatoPurchaseCode", blank(settings.getEnvatoPurchaseCode()));
        map.put("envatoEmail", blank(settings.getEnvatoEmail()));
        map.put("fcmServerKey", blank(settings.getFcmServerKey()));
        return map;
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }

    private String requiredText(Object value, String label) {
        String text = text(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return text;
    }

    private String requiredColor(Object value, String label) {
        String color = text(value);
        if (!color.matches("^#[0-9A-Fa-f]{6}$")) {
            throw new IllegalArgumentException(label + " must be a valid hex color");
        }
        return color.toLowerCase();
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
