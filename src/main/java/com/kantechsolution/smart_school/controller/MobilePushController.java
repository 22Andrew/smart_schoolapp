package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SystemPushService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mobile")
@RequiredArgsConstructor
public class MobilePushController {

    private final SystemPushService systemPushService;

    @PostMapping("/push-token")
    public ResponseEntity<Map<String, Object>> registerPushToken(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userType = text(payload.get("userType"));
            Long sourceId = parseLong(payload.get("sourceId"));
            String deviceToken = text(payload.get("deviceToken"));
            String platform = text(payload.get("platform"));
            systemPushService.registerToken(userType, sourceId, deviceToken, platform);
            response.put("success", true);
            response.put("message", "Push token registered successfully.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException error) {
            response.put("success", false);
            response.put("message", error.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Long parseLong(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return Long.parseLong(value.toString().trim());
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
