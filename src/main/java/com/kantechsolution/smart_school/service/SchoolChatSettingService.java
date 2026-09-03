package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolChatSetting;
import com.kantechsolution.smart_school.repository.SchoolChatSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolChatSettingService implements ApplicationRunner {

    private final SchoolChatSettingRepository repository;

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
        SchoolChatSetting settings = requireSettings();
        settings.setAllowStudentDeleteChat(boolValue(payload.get("allowStudentDeleteChat"), true));
        settings.setAllowGuardianDeleteChat(boolValue(payload.get("allowGuardianDeleteChat"), true));
        settings.setAllowStaffDeleteChat(boolValue(payload.get("allowStaffDeleteChat"), true));
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolChatSetting settings = SchoolChatSetting.builder()
                .allowStudentDeleteChat(true)
                .allowGuardianDeleteChat(true)
                .allowStaffDeleteChat(true)
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolChatSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolChatSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("allowStudentDeleteChat", settings.getAllowStudentDeleteChat());
        map.put("allowGuardianDeleteChat", settings.getAllowGuardianDeleteChat());
        map.put("allowStaffDeleteChat", settings.getAllowStaffDeleteChat());
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
