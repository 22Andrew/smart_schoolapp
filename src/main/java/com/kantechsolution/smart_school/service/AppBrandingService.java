package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppBrandingService {

    private final SchoolGeneralSettingService generalSettingService;
    private final SchoolLogoSettingService logoSettingService;

    @Transactional(readOnly = true)
    public Map<String, Object> getBranding() {
        Map<String, Object> general = generalSettingService.getSettings();
        Map<String, Object> logos = logoSettingService.getSettings();

        Map<String, Object> branding = new LinkedHashMap<>();
        branding.put("schoolName", general.get("schoolName"));
        branding.put("session", general.get("session"));
        branding.put("printLogo", logos.get("printLogo"));
        branding.put("adminLogo", logos.get("adminLogo"));
        branding.put("adminSmallLogo", logos.get("adminSmallLogo"));
        branding.put("appLogo", logos.get("appLogo"));
        return branding;
    }
}
