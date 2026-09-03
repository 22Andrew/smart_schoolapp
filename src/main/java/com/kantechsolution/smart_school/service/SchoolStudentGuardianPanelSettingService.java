package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolStudentGuardianPanelSetting;
import com.kantechsolution.smart_school.repository.SchoolStudentGuardianPanelSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolStudentGuardianPanelSettingService implements ApplicationRunner {

    private final SchoolStudentGuardianPanelSettingRepository repository;

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
        SchoolStudentGuardianPanelSetting settings = requireSettings();
        settings.setStudentLoginEnabled(boolValue(payload.get("studentLoginEnabled"), true));
        settings.setParentLoginEnabled(boolValue(payload.get("parentLoginEnabled"), true));
        settings.setStudentLoginAdmissionNo(boolValue(payload.get("studentLoginAdmissionNo"), true));
        settings.setStudentLoginMobileNumber(boolValue(payload.get("studentLoginMobileNumber"), true));
        settings.setStudentLoginEmail(boolValue(payload.get("studentLoginEmail"), true));
        settings.setParentLoginMobileNumber(boolValue(payload.get("parentLoginMobileNumber"), true));
        settings.setParentLoginEmail(boolValue(payload.get("parentLoginEmail"), true));
        settings.setAllowStudentAddTimeline(boolValue(payload.get("allowStudentAddTimeline"), false));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolStudentGuardianPanelSetting settings = SchoolStudentGuardianPanelSetting.builder()
                .studentLoginEnabled(true)
                .parentLoginEnabled(true)
                .studentLoginAdmissionNo(true)
                .studentLoginMobileNumber(true)
                .studentLoginEmail(true)
                .parentLoginMobileNumber(true)
                .parentLoginEmail(true)
                .allowStudentAddTimeline(false)
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolStudentGuardianPanelSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolStudentGuardianPanelSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("studentLoginEnabled", settings.getStudentLoginEnabled());
        map.put("parentLoginEnabled", settings.getParentLoginEnabled());
        map.put("studentLoginAdmissionNo", settings.getStudentLoginAdmissionNo());
        map.put("studentLoginMobileNumber", settings.getStudentLoginMobileNumber());
        map.put("studentLoginEmail", settings.getStudentLoginEmail());
        map.put("parentLoginMobileNumber", settings.getParentLoginMobileNumber());
        map.put("parentLoginEmail", settings.getParentLoginEmail());
        map.put("allowStudentAddTimeline", settings.getAllowStudentAddTimeline());
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
