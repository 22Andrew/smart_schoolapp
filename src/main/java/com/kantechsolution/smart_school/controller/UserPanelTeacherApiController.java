package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelTeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/teacher")
@RequiredArgsConstructor
public class UserPanelTeacherApiController {

    private final UserPanelTeacherService userPanelTeacherService;

    @GetMapping
    public ResponseEntity<?> listTeachers(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelTeacherService.listTeachers(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load teachers"));
        }
    }

    @PostMapping("/rating")
    public ResponseEntity<?> saveRating(Authentication authentication,
                                        @RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(userPanelTeacherService.saveRating(authentication, payload));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save rating"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
