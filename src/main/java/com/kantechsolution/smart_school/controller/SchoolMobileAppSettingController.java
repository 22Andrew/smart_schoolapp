package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolMobileAppSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolMobileAppSettingController {

    private final SchoolMobileAppSettingService mobileAppSettingService;

    @GetMapping("/schsettings/mobileapp")
    public String showMobileAppSettingsPage() {
        return "schsettings-mobileapp";
    }

    @GetMapping("/api/schsettings/mobile-app")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMobileAppSettings() {
        return ResponseEntity.ok(mobileAppSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/mobile-app")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMobileAppSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = mobileAppSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Mobile app settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save mobile app settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/schsettings/mobile-app/register")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMobileAppRegistration(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = mobileAppSettingService.saveRegistration(payload);
            response.put("success", true);
            response.put("message", "Android app purchase code registered successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to register Android app: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
