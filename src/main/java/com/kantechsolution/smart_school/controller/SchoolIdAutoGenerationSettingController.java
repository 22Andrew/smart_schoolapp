package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolIdAutoGenerationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolIdAutoGenerationSettingController {

    private final SchoolIdAutoGenerationSettingService idAutoGenerationSettingService;

    @GetMapping("/schsettings/idautogeneration")
    public String showIdAutoGenerationSettingsPage() {
        return "schsettings-idautogeneration";
    }

    @GetMapping("/api/schsettings/id-auto-generation")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getIdAutoGenerationSettings() {
        return ResponseEntity.ok(idAutoGenerationSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/id-auto-generation")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveIdAutoGenerationSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = idAutoGenerationSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "ID Auto Generation settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save ID Auto Generation settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/schsettings/id-auto-generation/next-admission-no")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> previewNextAdmissionNo() {
        return ResponseEntity.ok(idAutoGenerationSettingService.previewNextAdmissionNo());
    }

    @GetMapping("/api/schsettings/id-auto-generation/next-staff-id")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> previewNextStaffId() {
        return ResponseEntity.ok(idAutoGenerationSettingService.previewNextStaffId());
    }
}
