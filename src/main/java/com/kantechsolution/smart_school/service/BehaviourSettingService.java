package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.BehaviourSetting;
import com.kantechsolution.smart_school.repository.BehaviourSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class BehaviourSettingService {

    @Autowired
    private BehaviourSettingRepository settingRepository;

    @Transactional
    public Map<String, Object> getSettings() {
        return toRow(requireSettings());
    }

    @Transactional
    public Map<String, Object> save(Map<String, Object> body) {
        BehaviourSetting settings = requireSettings();
        settings.setStudentCommentEnabled(asBoolean(body.get("studentCommentEnabled")));
        settings.setParentCommentEnabled(asBoolean(body.get("parentCommentEnabled")));
        return toRow(settingRepository.save(settings));
    }

    private BehaviourSetting requireSettings() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() -> {
            BehaviourSetting defaults = new BehaviourSetting();
            defaults.setStudentCommentEnabled(true);
            defaults.setParentCommentEnabled(true);
            return settingRepository.save(defaults);
        });
    }

    private Map<String, Object> toRow(BehaviourSetting settings) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("studentCommentEnabled", settings.isStudentCommentEnabled());
        row.put("parentCommentEnabled", settings.isParentCommentEnabled());
        return row;
    }

    private boolean asBoolean(Object value) {
        if (value instanceof Boolean b) return b;
        if (value == null) return false;
        String text = String.valueOf(value).trim().toLowerCase();
        return "true".equals(text) || "1".equals(text) || "yes".equals(text) || "on".equals(text);
    }
}
