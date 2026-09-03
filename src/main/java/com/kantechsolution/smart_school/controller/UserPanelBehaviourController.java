package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelBehaviourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/user/behaviour")
@RequiredArgsConstructor
public class UserPanelBehaviourController {

    private final UserPanelBehaviourService userPanelBehaviourService;

    @GetMapping
    public ResponseEntity<?> getBehaviour(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelBehaviourService.getBehaviour(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load behaviour records"));
        }
    }

    @GetMapping("/{incidentId}/comments")
    public ResponseEntity<?> getComments(
            Authentication authentication,
            @PathVariable Long incidentId
    ) {
        try {
            return ResponseEntity.ok(userPanelBehaviourService.getComments(authentication, incidentId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load comments"));
        }
    }

    @PostMapping("/{incidentId}/comments")
    public ResponseEntity<?> addComment(
            Authentication authentication,
            @PathVariable Long incidentId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userPanelBehaviourService.addComment(authentication, incidentId, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save comment"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
