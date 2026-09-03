package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/content")
@RequiredArgsConstructor
public class UserPanelContentController {

    private final UserPanelContentService userPanelContentService;

    @GetMapping
    public ResponseEntity<?> listContents(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelContentService.listContents(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load content list"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getContent(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelContentService.getContent(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load content details"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
