package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ClassTeacherAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Page and API for Assign Class Teacher under Academics.
 */
@Controller
public class ClassTeacherAssignmentController {

    @Autowired
    private ClassTeacherAssignmentService assignmentService;

    @GetMapping("/teacher/assignclassteacher")
    public String showAssignClassTeacherPage(Model model) {
        return "assignclassteacher";
    }

    @GetMapping("/api/class-teachers")
    @ResponseBody
    public ResponseEntity<?> getAssignableTeachers() {
        try {
            return ResponseEntity.ok(assignmentService.getAssignableTeachers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load teachers"));
        }
    }

    @GetMapping("/api/class-teacher-assignments")
    @ResponseBody
    public ResponseEntity<?> getAllAssignments() {
        try {
            return ResponseEntity.ok(assignmentService.getAllAssignments());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load assignments"));
        }
    }

    @PostMapping("/api/class-teacher-assignments")
    @ResponseBody
    public ResponseEntity<?> createAssignment(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = assignmentService.create(
                    asLong(payload.get("classId")),
                    asString(payload.get("section")),
                    asString(payload.get("teacherCode")),
                    asString(payload.get("teacherName"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create assignment"));
        }
    }

    @PutMapping("/api/class-teacher-assignments/{id}")
    @ResponseBody
    public ResponseEntity<?> updateAssignment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> updated = assignmentService.update(
                    id,
                    asLong(payload.get("classId")),
                    asString(payload.get("section")),
                    asString(payload.get("teacherCode")),
                    asString(payload.get("teacherName"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Assignment not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update assignment"));
        }
    }

    @DeleteMapping("/api/class-teacher-assignments/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        try {
            assignmentService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete assignment"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || "".equals(String.valueOf(value).trim())) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
