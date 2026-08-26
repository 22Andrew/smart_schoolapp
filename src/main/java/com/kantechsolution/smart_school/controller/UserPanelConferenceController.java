package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelConferenceService;
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
@RequestMapping("/api/user/conference")
@RequiredArgsConstructor
public class UserPanelConferenceController {

    private final UserPanelConferenceService userPanelConferenceService;

    @GetMapping
    public ResponseEntity<?> listLiveClasses(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelConferenceService.listLiveClasses(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load live classes"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
