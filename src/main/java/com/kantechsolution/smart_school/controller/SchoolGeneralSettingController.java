package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolGeneralSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolGeneralSettingController {

    private final SchoolGeneralSettingService schoolGeneralSettingService;

    @GetMapping("/schsettings")
    public String showGeneralSettingsPage() {
        return "schsettings";
    }

    @GetMapping("/api/schsettings/form-options")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFormOptions() {
        return ResponseEntity.ok(schoolGeneralSettingService.getFormOptions());
    }

    @GetMapping("/api/schsettings/general")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getGeneralSettings() {
        return ResponseEntity.ok(schoolGeneralSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/general")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveGeneralSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = schoolGeneralSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "General settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save general settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
