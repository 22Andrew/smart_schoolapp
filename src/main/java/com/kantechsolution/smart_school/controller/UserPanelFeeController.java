package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/user/fees")
@RequiredArgsConstructor
public class UserPanelFeeController {

    private final UserPanelFeeService userPanelFeeService;

    @GetMapping
    public ResponseEntity<?> getFees(
            Authentication authentication,
            @RequestParam(required = false) String sessionYear
    ) {
        try {
            return ResponseEntity.ok(userPanelFeeService.getFeesPage(authentication, sessionYear));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student fees"));
        }
    }

    @PostMapping("/collect")
    public ResponseEntity<?> collectSelected(
            Authentication authentication,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            return ResponseEntity.ok(userPanelFeeService.collectSelected(authentication, payload));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to collect fees"));
        }
    }

    @PostMapping("/offline-bank")
    public ResponseEntity<?> submitOfflineBankPayment(
            Authentication authentication,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userPanelFeeService.submitOfflineBankPayment(authentication, payload));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to submit offline bank payment"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
