package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolBackendThemeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolBackendThemeSettingController {

    private final SchoolBackendThemeSettingService backendThemeSettingService;

    @GetMapping("/schsettings/backendtheme")
    public String showBackendThemeSettingsPage() {
        return "schsettings-backendtheme";
    }

    @GetMapping("/api/schsettings/backend-theme")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getBackendThemeSettings() {
        return ResponseEntity.ok(backendThemeSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/backend-theme")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveBackendThemeSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = backendThemeSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Backend theme saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save backend theme: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
