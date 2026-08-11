package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.QrAttendanceSetting;
import com.kantechsolution.smart_school.repository.QrAttendanceSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QrAttendanceSettingService implements ApplicationRunner {

    private final QrAttendanceSettingRepository settingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (settingRepository.count() > 0) {
            return;
        }
        settingRepository.save(QrAttendanceSetting.builder()
                .autoAttendance(true)
                .sensorDeviceEnabled(true)
                .cameraDeviceEnabled(true)
                .selectedCamera("primary")
                .build());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> body) {
        boolean sensorEnabled = asBoolean(body.get("sensorDeviceEnabled"));
        boolean cameraEnabled = asBoolean(body.get("cameraDeviceEnabled"));
        if (!sensorEnabled && !cameraEnabled) {
            throw new IllegalArgumentException("Select at least one scanner device type");
        }

        String selectedCamera = text(body.get("selectedCamera"));
        if (!"primary".equalsIgnoreCase(selectedCamera) && !"secondary".equalsIgnoreCase(selectedCamera)) {
            throw new IllegalArgumentException("Select Camera is required");
        }

        QrAttendanceSetting settings = requireSettings();
        settings.setAutoAttendance(asBoolean(body.get("autoAttendance")));
        settings.setSensorDeviceEnabled(sensorEnabled);
        settings.setCameraDeviceEnabled(cameraEnabled);
        settings.setSelectedCamera(selectedCamera.toLowerCase());
        return toMap(settingRepository.save(settings));
    }

    private QrAttendanceSetting requireSettings() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() ->
                settingRepository.save(QrAttendanceSetting.builder()
                        .autoAttendance(true)
                        .sensorDeviceEnabled(true)
                        .cameraDeviceEnabled(true)
                        .selectedCamera("primary")
                        .build()));
    }

    private Map<String, Object> toMap(QrAttendanceSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("autoAttendance", settings.isAutoAttendance());
        map.put("sensorDeviceEnabled", settings.isSensorDeviceEnabled());
        map.put("cameraDeviceEnabled", settings.isCameraDeviceEnabled());
        map.put("selectedCamera", settings.getSelectedCamera());
        return map;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
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
