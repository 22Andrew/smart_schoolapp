package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ApproveLeaveService;
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
public class ApproveLeaveController {

    private final ApproveLeaveService approveLeaveService;

    @GetMapping("/approveleave")
    public String showApproveLeavePage() {
        return "approveleave";
    }

    @GetMapping("/api/approve-leaves")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchLeaves(
            @RequestParam Long classId,
            @RequestParam String section) {
        return ResponseEntity.ok(approveLeaveService.searchLeaves(classId, section));
    }

    @GetMapping("/api/approve-leaves/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getStudents(
            @RequestParam Long classId,
            @RequestParam String section) {
        return ResponseEntity.ok(approveLeaveService.getStudents(classId, section));
    }

    @GetMapping("/api/approve-leaves/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLeaveById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(approveLeaveService.getLeaveById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/api/approve-leaves", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createLeave(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = approveLeaveService.createLeave(payload, document);
            response.put("success", true);
            response.put("message", "Leave saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save leave: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/api/approve-leaves/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLeave(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = approveLeaveService.updateLeave(id, payload, document);
            response.put("success", true);
            response.put("message", "Leave updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update leave: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/approve-leaves/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLeave(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            approveLeaveService.deleteLeave(id);
            response.put("success", true);
            response.put("message", "Leave deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete leave: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
