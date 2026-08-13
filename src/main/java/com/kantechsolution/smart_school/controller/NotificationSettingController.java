package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class NotificationSettingController {

    private final NotificationSettingService notificationSettingService;

    @GetMapping("/admin/notification/setting")
    public String showNotificationSettingPage() {
        return "admin-notification-setting";
    }

    @GetMapping("/api/admin/notification/settings")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getNotificationSettings() {
        return ResponseEntity.ok(notificationSettingService.getAllSettings());
    }

    @PutMapping("/api/admin/notification/settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveNotificationSettings(@RequestBody List<Map<String, Object>> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> saved = notificationSettingService.saveAllSettings(payload);
            response.put("success", true);
            response.put("message", "Notification settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save notification settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
