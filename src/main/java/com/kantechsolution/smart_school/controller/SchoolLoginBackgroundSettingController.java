package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolLoginBackgroundSettingService;
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
public class SchoolLoginBackgroundSettingController {

    private final SchoolLoginBackgroundSettingService loginBackgroundSettingService;

    @GetMapping("/schsettings/logopagebackground")
    public String showLoginBackgroundSettingsPage() {
        return "schsettings-logopagebackground";
    }

    @GetMapping("/api/schsettings/login-background")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLoginBackgroundSettings() {
        return ResponseEntity.ok(loginBackgroundSettingService.getSettings());
    }

    @PostMapping(value = "/api/schsettings/login-background/{type}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLoginBackground(
            @PathVariable String type,
            @RequestPart("background") MultipartFile background) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = loginBackgroundSettingService.updateBackground(type, background);
            response.put("success", true);
            response.put("message", "Background updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update background: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
