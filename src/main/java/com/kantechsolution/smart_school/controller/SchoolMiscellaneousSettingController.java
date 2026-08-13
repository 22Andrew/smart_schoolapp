package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolMiscellaneousSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolMiscellaneousSettingController {

    private final SchoolMiscellaneousSettingService miscellaneousSettingService;

    @GetMapping("/schsettings/miscellaneous")
    public String showMiscellaneousSettingsPage() {
        return "schsettings-miscellaneous";
    }

    @GetMapping("/api/schsettings/miscellaneous")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMiscellaneousSettings() {
        return ResponseEntity.ok(miscellaneousSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/miscellaneous")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMiscellaneousSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = miscellaneousSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Miscellaneous settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save Miscellaneous settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
