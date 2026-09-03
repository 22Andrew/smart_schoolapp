package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelSyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/syllabus")
@RequiredArgsConstructor
public class UserPanelSyllabusController {

    private final UserPanelSyllabusService userPanelSyllabusService;

    @GetMapping
    public ResponseEntity<?> getWeek(
            Authentication authentication,
            @RequestParam(required = false) String weekStart
    ) {
        try {
            LocalDate start = weekStart == null || weekStart.isBlank() ? null : LocalDate.parse(weekStart);
            return ResponseEntity.ok(userPanelSyllabusService.getWeek(authentication, start));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load lesson plan"));
        }
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<?> getView(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelSyllabusService.getViewData(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load lesson plan details"));
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userPanelSyllabusService.addComment(authentication, id, payload));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save comment"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
