package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolStudentGuardianPanelSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolStudentGuardianPanelSettingController {

    private final SchoolStudentGuardianPanelSettingService studentGuardianPanelSettingService;

    @GetMapping("/schsettings/studentguardianpanel")
    public String showStudentGuardianPanelSettingsPage() {
        return "schsettings-studentguardianpanel";
    }

    @GetMapping("/api/schsettings/student-guardian-panel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getStudentGuardianPanelSettings() {
        return ResponseEntity.ok(studentGuardianPanelSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/student-guardian-panel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveStudentGuardianPanelSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = studentGuardianPanelSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Student / Guardian Panel settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save Student / Guardian Panel settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
