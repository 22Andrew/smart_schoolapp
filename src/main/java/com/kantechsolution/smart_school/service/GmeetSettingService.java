package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.GmeetSetting;
import com.kantechsolution.smart_school.repository.GmeetSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GmeetSettingService implements ApplicationRunner {

    @Autowired
    private GmeetSettingRepository settingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (settingRepository.count() > 0) {
            return;
        }
        GmeetSetting settings = new GmeetSetting();
        settings.setApiKey("988720996993-ctjb5ibg56b45fu505l3lv310bv55d79.apps.googleusercontent.com");
        settings.setApiSecret("XkSqRpcFacU2Gg6QqCZP8kVP");
        settings.setUseGoogleCalendarApi(false);
        settings.setParentLiveClass(false);
        settingRepository.save(settings);
    }

    @Transactional
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> body) {
        if (body.get("useGoogleCalendarApi") == null) {
            throw new IllegalArgumentException("Use Google Calendar Api is required");
        }
        if (body.get("parentLiveClass") == null) {
            throw new IllegalArgumentException("Parent Live Class is required");
        }

        GmeetSetting settings = requireSettings();
        settings.setApiKey(text(body.get("apiKey")));
        settings.setApiSecret(text(body.get("apiSecret")));
        settings.setUseGoogleCalendarApi(asBoolean(body.get("useGoogleCalendarApi")));
        settings.setParentLiveClass(asBoolean(body.get("parentLiveClass")));
        return toMap(settingRepository.save(settings));
    }

    private GmeetSetting requireSettings() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() -> {
            GmeetSetting defaults = new GmeetSetting();
            return settingRepository.save(defaults);
        });
    }

    private Map<String, Object> toMap(GmeetSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("apiKey", blank(settings.getApiKey()));
        map.put("apiSecret", blank(settings.getApiSecret()));
        map.put("useGoogleCalendarApi", settings.isUseGoogleCalendarApi());
        map.put("parentLiveClass", settings.isParentLiveClass());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }

    private boolean asBoolean(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        String text = String.valueOf(value).trim();
        return "true".equalsIgnoreCase(text)
                || "1".equals(text)
                || "enabled".equalsIgnoreCase(text)
                || "on".equalsIgnoreCase(text)
                || "yes".equalsIgnoreCase(text);
    }
}
