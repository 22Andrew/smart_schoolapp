package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolMaintenanceSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolMaintenanceSettingController {

    private final SchoolMaintenanceSettingService maintenanceSettingService;

    @GetMapping("/schsettings/maintenance")
    public String showMaintenanceSettingsPage() {
        return "schsettings-maintenance";
    }

    @GetMapping("/api/schsettings/maintenance")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMaintenanceSettings() {
        return ResponseEntity.ok(maintenanceSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/maintenance")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMaintenanceSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = maintenanceSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Maintenance settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save Maintenance settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
