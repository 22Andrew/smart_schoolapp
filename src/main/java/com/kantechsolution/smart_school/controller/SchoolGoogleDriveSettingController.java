package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolGoogleDriveSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolGoogleDriveSettingController {

    private final SchoolGoogleDriveSettingService googleDriveSettingService;

    @GetMapping("/schsettings/googledrivesetting")
    public String showGoogleDriveSettingsPage() {
        return "schsettings-googledrivesetting";
    }

    @GetMapping("/api/schsettings/google-drive")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getGoogleDriveSettings() {
        return ResponseEntity.ok(googleDriveSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/google-drive")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveGoogleDriveSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = googleDriveSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Google Drive settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save Google Drive settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
