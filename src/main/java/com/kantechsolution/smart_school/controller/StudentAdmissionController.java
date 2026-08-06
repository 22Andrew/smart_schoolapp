package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StudentAdmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * API for Student Admission persistence.
 */
@Controller
public class StudentAdmissionController {

    @Autowired
    private StudentAdmissionService studentAdmissionService;

    @GetMapping("/api/student-admissions")
    @ResponseBody
    public ResponseEntity<?> getAllAdmissions(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String keyword
    ) {
        try {
            if (classId == null && (section == null || section.isBlank())
                    && (keyword == null || keyword.isBlank())) {
                return ResponseEntity.ok(studentAdmissionService.getAllAdmissions());
            }
            return ResponseEntity.ok(studentAdmissionService.searchAdmissions(classId, section, keyword));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student admissions"));
        }
    }

    @GetMapping("/api/student-admissions/{id}")
    @ResponseBody
    public ResponseEntity<?> getAdmission(@PathVariable Long id) {
        try {
            return studentAdmissionService.getById(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student admission"));
        }
    }

    @PostMapping(value = "/api/student-admissions", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> createAdmissionJson(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = studentAdmissionService.createAdmission(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create student admission"));
        }
    }

    @PostMapping(value = "/api/student-admissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> createAdmissionMultipart(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "studentPhoto", required = false) MultipartFile studentPhoto
    ) {
        try {
            Map<String, Object> saved = studentAdmissionService.createAdmission(payload, studentPhoto);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create student admission"));
        }
    }

    @PutMapping(value = "/api/student-admissions/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> updateAdmissionJson(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> updated = studentAdmissionService.updateAdmission(id, payload);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Student admission not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update student admission"));
        }
    }

    @PutMapping(value = "/api/student-admissions/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> updateAdmissionMultipart(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "studentPhoto", required = false) MultipartFile studentPhoto
    ) {
        try {
            Map<String, Object> updated = studentAdmissionService.updateAdmission(id, payload, studentPhoto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Student admission not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update student admission"));
        }
    }

    @DeleteMapping("/api/student-admissions/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteAdmission(@PathVariable Long id) {
        try {
            studentAdmissionService.deleteAdmission(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete student admission"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
