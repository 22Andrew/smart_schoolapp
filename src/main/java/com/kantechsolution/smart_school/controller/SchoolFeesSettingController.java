package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolFeesSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolFeesSettingController {

    private final SchoolFeesSettingService feesSettingService;

    @GetMapping("/schsettings/fees")
    public String showFeesSettingsPage() {
        return "schsettings-fees";
    }

    @GetMapping("/api/schsettings/fees")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFeesSettings() {
        return ResponseEntity.ok(feesSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/fees")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveFeesSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = feesSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Fees settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save fees settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
