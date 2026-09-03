package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelApplyLeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/applyleave")
@RequiredArgsConstructor
public class UserPanelApplyLeaveController {

    private final UserPanelApplyLeaveService userPanelApplyLeaveService;

    @GetMapping
    public ResponseEntity<?> listLeaves(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelApplyLeaveService.listLeaves(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load leave list"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLeave(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelApplyLeaveService.getLeave(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load leave"));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createLeave(
            Authentication authentication,
            @RequestParam String applyDate,
            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestParam(required = false) String reason,
            @RequestParam(value = "document", required = false) MultipartFile document
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userPanelApplyLeaveService.saveLeave(
                            authentication, null, applyDate, fromDate, toDate, reason, document));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save leave"));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateLeave(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String applyDate,
            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestParam(required = false) String reason,
            @RequestParam(value = "document", required = false) MultipartFile document
    ) {
        try {
            return ResponseEntity.ok(userPanelApplyLeaveService.saveLeave(
                    authentication, id, applyDate, fromDate, toDate, reason, document));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update leave"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelApplyLeaveService.deleteLeave(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete leave"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
