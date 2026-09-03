package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelStudentCourseService;
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
@RequestMapping("/api/user/user/studentcourse")
@RequiredArgsConstructor
public class UserPanelStudentCourseController {

    private final UserPanelStudentCourseService userPanelStudentCourseService;

    @GetMapping
    public ResponseEntity<?> getCourses(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelStudentCourseService.getCourses(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load courses"));
        }
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseDetail(
            Authentication authentication,
            @PathVariable Long courseId
    ) {
        try {
            return ResponseEntity.ok(userPanelStudentCourseService.getCourseDetail(authentication, courseId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load course"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
