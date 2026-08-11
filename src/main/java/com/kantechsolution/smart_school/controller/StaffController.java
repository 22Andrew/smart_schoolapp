package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class StaffController {

    private final StaffMemberService staffMemberService;

    @GetMapping("/staff")
    public String showStaffDirectoryPage() {
        return "staff";
    }

    @GetMapping("/api/staff/form-options")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFormOptions() {
        return ResponseEntity.ok(staffMemberService.formOptions());
    }

    @GetMapping("/api/staff")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStaff(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {
        if ((role == null || role.isBlank()) && (keyword == null || keyword.isBlank())) {
            return ResponseEntity.ok(staffMemberService.getAllActive());
        }
        return ResponseEntity.ok(staffMemberService.search(role, keyword));
    }

    @GetMapping("/api/staff/{id}")
    @ResponseBody
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        return staffMemberService.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/api/staff", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createStaff(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "staffPhoto", required = false) MultipartFile staffPhoto,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "joiningLetter", required = false) MultipartFile joiningLetter,
            @RequestPart(value = "resignationLetter", required = false) MultipartFile resignationLetter,
            @RequestPart(value = "otherDocument", required = false) MultipartFile otherDocument) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, MultipartFile> documents = documentParts(resume, joiningLetter, resignationLetter, otherDocument);
            Map<String, Object> saved = staffMemberService.create(payload, staffPhoto, documents);
            response.put("success", true);
            response.put("message", "Staff member saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/api/staff/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateStaff(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "staffPhoto", required = false) MultipartFile staffPhoto,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestPart(value = "joiningLetter", required = false) MultipartFile joiningLetter,
            @RequestPart(value = "resignationLetter", required = false) MultipartFile resignationLetter,
            @RequestPart(value = "otherDocument", required = false) MultipartFile otherDocument) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, MultipartFile> documents = documentParts(resume, joiningLetter, resignationLetter, otherDocument);
            Map<String, Object> updated = staffMemberService.update(id, payload, staffPhoto, documents);
            response.put("success", true);
            response.put("message", "Staff member updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/staff/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            staffMemberService.delete(id);
            response.put("success", true);
            response.put("message", "Staff member deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete staff member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Map<String, MultipartFile> documentParts(MultipartFile resume, MultipartFile joiningLetter,
                                                     MultipartFile resignationLetter, MultipartFile otherDocument) {
        Map<String, MultipartFile> documents = new HashMap<>();
        if (resume != null && !resume.isEmpty()) {
            documents.put("resume", resume);
        }
        if (joiningLetter != null && !joiningLetter.isEmpty()) {
            documents.put("joiningLetter", joiningLetter);
        }
        if (resignationLetter != null && !resignationLetter.isEmpty()) {
            documents.put("resignationLetter", resignationLetter);
        }
        if (otherDocument != null && !otherDocument.isEmpty()) {
            documents.put("otherDocument", otherDocument);
        }
        return documents;
    }
}
