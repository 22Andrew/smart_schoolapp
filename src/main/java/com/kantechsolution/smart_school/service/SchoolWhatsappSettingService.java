package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolWhatsappSetting;
import com.kantechsolution.smart_school.repository.SchoolWhatsappSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchoolWhatsappSettingService implements ApplicationRunner {

    private static final String DEFAULT_MOBILE = "9800000001";

    private final SchoolWhatsappSettingRepository repository;

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

    @Transactional(readOnly = true)
    public String getAdminPanelWhatsappUrl() {
        SchoolWhatsappSetting settings = requireSettings();
        return resolveWhatsappUrl(settings.getAdminPanelWhatsappLinkEnabled(), settings.getAdminPanelMobileNo());
    }

    @Transactional(readOnly = true)
    public String getStudentGuardianPanelWhatsappUrl() {
        SchoolWhatsappSetting settings = requireSettings();
        return resolveWhatsappUrl(
                settings.getStudentGuardianPanelWhatsappLinkEnabled(),
                settings.getStudentGuardianPanelMobileNo());
    }

    public String resolveWhatsappUrl(Boolean enabled, String mobileNo) {
        if (!Boolean.TRUE.equals(enabled)) {
            return null;
        }
        return buildWhatsappUrl(mobileNo);
    }

    public static String buildWhatsappUrl(String mobileNo) {
        if (mobileNo == null || mobileNo.isBlank()) {
            return null;
        }
        String digits = mobileNo.replaceAll("\\D", "");
        if (digits.isBlank()) {
            return null;
        }
        return "https://wa.me/" + digits;
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        SchoolWhatsappSetting settings = requireSettings();

        settings.setFrontSiteWhatsappLinkEnabled(boolValue(payload.get("frontSiteWhatsappLinkEnabled"), true));
        settings.setFrontSiteMobileNo(text(payload.get("frontSiteMobileNo")));
        settings.setFrontSiteTimeFrom(text(payload.get("frontSiteTimeFrom")));
        settings.setFrontSiteTimeTo(text(payload.get("frontSiteTimeTo")));

        settings.setAdminPanelWhatsappLinkEnabled(boolValue(payload.get("adminPanelWhatsappLinkEnabled"), true));
        settings.setAdminPanelMobileNo(text(payload.get("adminPanelMobileNo")));
        settings.setAdminPanelTimeFrom(text(payload.get("adminPanelTimeFrom")));
        settings.setAdminPanelTimeTo(text(payload.get("adminPanelTimeTo")));

        settings.setStudentGuardianPanelWhatsappLinkEnabled(
                boolValue(payload.get("studentGuardianPanelWhatsappLinkEnabled"), true));
        settings.setStudentGuardianPanelMobileNo(text(payload.get("studentGuardianPanelMobileNo")));
        settings.setStudentGuardianPanelTimeFrom(text(payload.get("studentGuardianPanelTimeFrom")));
        settings.setStudentGuardianPanelTimeTo(text(payload.get("studentGuardianPanelTimeTo")));

        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolWhatsappSetting settings = SchoolWhatsappSetting.builder()
                .frontSiteWhatsappLinkEnabled(true)
                .frontSiteMobileNo(DEFAULT_MOBILE)
                .frontSiteTimeFrom("")
                .frontSiteTimeTo("")
                .adminPanelWhatsappLinkEnabled(true)
                .adminPanelMobileNo(DEFAULT_MOBILE)
                .adminPanelTimeFrom("")
                .adminPanelTimeTo("")
                .studentGuardianPanelWhatsappLinkEnabled(true)
                .studentGuardianPanelMobileNo(DEFAULT_MOBILE)
                .studentGuardianPanelTimeFrom("")
                .studentGuardianPanelTimeTo("")
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolWhatsappSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolWhatsappSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("frontSiteWhatsappLinkEnabled", settings.getFrontSiteWhatsappLinkEnabled());
        map.put("frontSiteMobileNo", blank(settings.getFrontSiteMobileNo()));
        map.put("frontSiteTimeFrom", blank(settings.getFrontSiteTimeFrom()));
        map.put("frontSiteTimeTo", blank(settings.getFrontSiteTimeTo()));
        map.put("adminPanelWhatsappLinkEnabled", settings.getAdminPanelWhatsappLinkEnabled());
        map.put("adminPanelMobileNo", blank(settings.getAdminPanelMobileNo()));
        map.put("adminPanelTimeFrom", blank(settings.getAdminPanelTimeFrom()));
        map.put("adminPanelTimeTo", blank(settings.getAdminPanelTimeTo()));
        map.put("studentGuardianPanelWhatsappLinkEnabled", settings.getStudentGuardianPanelWhatsappLinkEnabled());
        map.put("studentGuardianPanelMobileNo", blank(settings.getStudentGuardianPanelMobileNo()));
        map.put("studentGuardianPanelTimeFrom", blank(settings.getStudentGuardianPanelTimeFrom()));
        map.put("studentGuardianPanelTimeTo", blank(settings.getStudentGuardianPanelTimeTo()));
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

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
