package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolWhatsappSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolWhatsappSettingController {

    private final SchoolWhatsappSettingService whatsappSettingService;

    @GetMapping("/schsettings/whatsappsettings")
    public String showWhatsappSettingsPage() {
        return "schsettings-whatsappsettings";
    }

    @GetMapping("/api/schsettings/whatsapp")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getWhatsappSettings() {
        return ResponseEntity.ok(whatsappSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/whatsapp")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveWhatsappSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = whatsappSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Whatsapp settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save Whatsapp settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
