package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/notification")
@RequiredArgsConstructor
public class UserPanelNotificationController {

    private final UserPanelNotificationService userPanelNotificationService;

    @GetMapping
    public ResponseEntity<?> listNotifications(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelNotificationService.listNotifications(authentication));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load notices"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
