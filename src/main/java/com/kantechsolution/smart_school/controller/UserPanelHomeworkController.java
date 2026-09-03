package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelHomeworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/homework")
@RequiredArgsConstructor
public class UserPanelHomeworkController {

    private final UserPanelHomeworkService userPanelHomeworkService;

    @GetMapping
    public ResponseEntity<?> listHomework(
            Authentication authentication,
            @RequestParam(defaultValue = "upcoming") String tab
    ) {
        try {
            return ResponseEntity.ok(userPanelHomeworkService.listHomework(authentication, tab));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load homework"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHomework(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelHomeworkService.getHomework(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load homework details"));
        }
    }

    @PostMapping(value = "/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitHomework(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "document", required = false) MultipartFile document
    ) {
        try {
            return ResponseEntity.ok(userPanelHomeworkService.submitHomework(authentication, id, message, document));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save homework"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
