package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StudentAdmissionService;
import com.kantechsolution.smart_school.service.StudentSiblingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API for Student Admission persistence.
 */
@Controller
public class StudentAdmissionController {

    @Autowired
    private StudentAdmissionService studentAdmissionService;

    @Autowired
    private StudentSiblingService studentSiblingService;

    @GetMapping("/api/student-admissions/siblings")
    @ResponseBody
    public ResponseEntity<?> listSiblings(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String draftToken
    ) {
        try {
            return ResponseEntity.ok(studentSiblingService.listSiblings(studentId, draftToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load siblings"));
        }
    }

    @PostMapping("/api/student-admissions/siblings")
    @ResponseBody
    public ResponseEntity<?> addSibling(@RequestBody Map<String, Object> payload) {
        try {
            Long studentId = parseLong(payload.get("studentId"));
            Long siblingId = parseLong(payload.get("siblingId"));
            String draftToken = payload.get("draftToken") == null
                    ? null : String.valueOf(payload.get("draftToken")).trim();
            Map<String, Object> saved = studentSiblingService.addSibling(studentId, siblingId, draftToken);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to add sibling"));
        }
    }

    @DeleteMapping("/api/student-admissions/siblings/{siblingId}")
    @ResponseBody
    public ResponseEntity<?> removeSibling(
            @PathVariable Long siblingId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String draftToken
    ) {
        try {
            studentSiblingService.removeSibling(studentId, siblingId, draftToken);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to remove sibling"));
        }
    }

    @GetMapping("/api/student-admissions")
    @ResponseBody
    public ResponseEntity<?> getAllAdmissions(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean disabled,
            @RequestParam(required = false) Boolean online
    ) {
        try {
            return ResponseEntity.ok(studentAdmissionService.searchAdmissions(
                    classId, section, keyword, disabled, online));
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

    @PostMapping("/api/student-admissions/bulk-delete")
    @ResponseBody
    public ResponseEntity<?> bulkDelete(@RequestBody Map<String, Object> payload) {
        try {
            List<Long> ids = new ArrayList<>();
            Object raw = payload.get("ids");
            if (raw instanceof List<?> list) {
                for (Object value : list) {
                    if (value != null && !String.valueOf(value).isBlank()) {
                        ids.add(Long.valueOf(String.valueOf(value).trim()));
                    }
                }
            }
            int deleted = studentAdmissionService.bulkDeleteAdmissions(ids);
            Map<String, Object> body = new HashMap<>();
            body.put("deleted", deleted);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete students"));
        }
    }

    @PostMapping("/api/student-admissions/{id}/disable")
    @ResponseBody
    public ResponseEntity<?> disableStudent(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        try {
            String reason = payload == null || payload.get("disableReason") == null
                    ? null : String.valueOf(payload.get("disableReason"));
            return ResponseEntity.ok(studentAdmissionService.setDisabledStatus(id, true, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to disable student"));
        }
    }

    @PostMapping("/api/student-admissions/{id}/enable")
    @ResponseBody
    public ResponseEntity<?> enableStudent(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentAdmissionService.setDisabledStatus(id, false, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to enable student"));
        }
    }

    @GetMapping("/api/multi-class-students")
    @ResponseBody
    public ResponseEntity<?> searchMultiClass(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        try {
            return ResponseEntity.ok(studentAdmissionService.searchMultiClassStudents(classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load multi-class students"));
        }
    }

    @GetMapping("/api/student-admissions/{id}/class-assignments")
    @ResponseBody
    public ResponseEntity<?> getClassAssignments(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentAdmissionService.getClassAssignments(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load class assignments"));
        }
    }

    @PutMapping("/api/student-admissions/{id}/class-assignments")
    @ResponseBody
    public ResponseEntity<?> saveClassAssignments(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            List<Map<String, Object>> items = new ArrayList<>();
            Object raw = payload.get("assignments");
            if (raw instanceof List<?> list) {
                for (Object value : list) {
                    if (value instanceof Map<?, ?> map) {
                        Map<String, Object> item = new HashMap<>();
                        map.forEach((k, v) -> item.put(String.valueOf(k), v));
                        items.add(item);
                    }
                }
            }
            return ResponseEntity.ok(studentAdmissionService.saveClassAssignments(id, items));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save class assignments"));
        }
    }

    private Long parseLong(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) return null;
        return Long.valueOf(text);
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
