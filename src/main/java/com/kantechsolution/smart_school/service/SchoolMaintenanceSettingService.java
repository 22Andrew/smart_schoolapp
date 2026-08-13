package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolMaintenanceSetting;
import com.kantechsolution.smart_school.repository.SchoolMaintenanceSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolMaintenanceSettingService implements ApplicationRunner {

    private final SchoolMaintenanceSettingRepository repository;

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
        SchoolMaintenanceSetting settings = requireSettings();
        settings.setMaintenanceMode(boolValue(payload.get("maintenanceMode"), false));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolMaintenanceSetting settings = SchoolMaintenanceSetting.builder()
                .maintenanceMode(false)
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolMaintenanceSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolMaintenanceSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("maintenanceMode", settings.getMaintenanceMode());
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
}
