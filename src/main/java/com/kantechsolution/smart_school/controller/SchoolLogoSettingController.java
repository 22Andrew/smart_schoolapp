package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolLogoSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolLogoSettingController {

    private final SchoolLogoSettingService schoolLogoSettingService;

    @GetMapping("/schsettings/logo")
    public String showLogoSettingsPage() {
        return "schsettings-logo";
    }

    @GetMapping("/api/schsettings/logo")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLogoSettings() {
        return ResponseEntity.ok(schoolLogoSettingService.getSettings());
    }

    @PostMapping(value = "/api/schsettings/logo/{type}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLogo(
            @PathVariable String type,
            @RequestPart("logo") MultipartFile logo) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = schoolLogoSettingService.updateLogo(type, logo);
            response.put("success", true);
            response.put("message", "Logo updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update logo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
