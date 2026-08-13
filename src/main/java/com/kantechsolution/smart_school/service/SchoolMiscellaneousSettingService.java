package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolMiscellaneousSetting;
import com.kantechsolution.smart_school.repository.SchoolMiscellaneousSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SchoolMiscellaneousSettingService implements ApplicationRunner {

    private static final Set<String> VALID_SCAN_TYPES = Set.of(
            SchoolMiscellaneousSetting.SCAN_TYPE_BARCODE,
            SchoolMiscellaneousSetting.SCAN_TYPE_QR_CODE
    );

    private final SchoolMiscellaneousSettingRepository repository;

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
        SchoolMiscellaneousSetting settings = requireSettings();

        settings.setShowMeOnlyMyQuestion(boolValue(payload.get("showMeOnlyMyQuestion"), false));
        settings.setIdCardScanType(scanType(payload.get("idCardScanType")));
        settings.setExamResultPageInFrontSite(boolValue(payload.get("examResultPageInFrontSite"), true));
        settings.setDownloadAdmitCardInStudentParentPanel(
                boolValue(payload.get("downloadAdmitCardInStudentParentPanel"), false));
        settings.setTeacherRestrictedMode(boolValue(payload.get("teacherRestrictedMode"), false));
        settings.setSuperadminVisibility(boolValue(payload.get("superadminVisibility"), false));
        settings.setEventReminder(boolValue(payload.get("eventReminder"), false));
        settings.setStaffApplyLeaveNotificationEmail(text(payload.get("staffApplyLeaveNotificationEmail")));
        settings.setEnableMultiClassSelectionInStudentAdmission(
                boolValue(payload.get("enableMultiClassSelectionInStudentAdmission"), false));

        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolMiscellaneousSetting settings = SchoolMiscellaneousSetting.builder()
                .showMeOnlyMyQuestion(false)
                .idCardScanType(SchoolMiscellaneousSetting.SCAN_TYPE_BARCODE)
                .examResultPageInFrontSite(true)
                .downloadAdmitCardInStudentParentPanel(false)
                .teacherRestrictedMode(false)
                .superadminVisibility(false)
                .eventReminder(false)
                .staffApplyLeaveNotificationEmail("")
                .enableMultiClassSelectionInStudentAdmission(false)
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolMiscellaneousSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolMiscellaneousSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("showMeOnlyMyQuestion", settings.getShowMeOnlyMyQuestion());
        map.put("idCardScanType", blank(settings.getIdCardScanType()));
        map.put("examResultPageInFrontSite", settings.getExamResultPageInFrontSite());
        map.put("downloadAdmitCardInStudentParentPanel", settings.getDownloadAdmitCardInStudentParentPanel());
        map.put("teacherRestrictedMode", settings.getTeacherRestrictedMode());
        map.put("superadminVisibility", settings.getSuperadminVisibility());
        map.put("eventReminder", settings.getEventReminder());
        map.put("staffApplyLeaveNotificationEmail", blank(settings.getStaffApplyLeaveNotificationEmail()));
        map.put("enableMultiClassSelectionInStudentAdmission",
                settings.getEnableMultiClassSelectionInStudentAdmission());
        return map;
    }

    private String scanType(Object value) {
        String type = text(value).toUpperCase();
        if ("QR_CODE".equals(type) || "QRCODE".equals(type) || "QR CODE".equals(type)) {
            return SchoolMiscellaneousSetting.SCAN_TYPE_QR_CODE;
        }
        if (VALID_SCAN_TYPES.contains(type)) {
            return type;
        }
        return SchoolMiscellaneousSetting.SCAN_TYPE_BARCODE;
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
