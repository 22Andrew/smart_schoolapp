package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelOnlineExamService;
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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/onlineexam")
@RequiredArgsConstructor
public class UserPanelOnlineExamController {

    private final UserPanelOnlineExamService userPanelOnlineExamService;

    @GetMapping
    public ResponseEntity<?> listExams(
            Authentication authentication,
            @RequestParam(defaultValue = "upcoming") String tab
    ) {
        try {
            return ResponseEntity.ok(userPanelOnlineExamService.listExams(authentication, tab));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load online exams"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExam(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelOnlineExamService.getExam(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load exam details"));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startExam(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userPanelOnlineExamService.startExam(authentication, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to start exam"));
        }
    }

    @PostMapping("/{id}/answers")
    public ResponseEntity<?> saveAnswers(Authentication authentication,
                                         @PathVariable Long id,
                                         @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(userPanelOnlineExamService.saveAnswers(authentication, id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save answers"));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitExam(Authentication authentication,
                                        @PathVariable Long id,
                                        @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(userPanelOnlineExamService.submitExam(authentication, id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to submit exam"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
