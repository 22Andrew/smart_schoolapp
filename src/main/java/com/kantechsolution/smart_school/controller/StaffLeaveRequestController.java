package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffLeaveRequestService;
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
public class StaffLeaveRequestController {

    private final StaffLeaveRequestService staffLeaveRequestService;

    @GetMapping("/leaverequest")
    public String showLeaveRequestPage() {
        return "leaverequest";
    }

    @GetMapping("/staff/leaverequest")
    public String showStaffApplyLeavePage() {
        return "staff-leaverequest";
    }

    @GetMapping("/api/staff-leave-requests")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listLeaveRequests() {
        return ResponseEntity.ok(staffLeaveRequestService.listAll());
    }

    @GetMapping("/api/staff-leave-requests/my")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listMyLeaveRequests() {
        return ResponseEntity.ok(staffLeaveRequestService.listMyLeaves());
    }

    @GetMapping("/api/staff-leave-requests/current-staff")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCurrentStaff() {
        return ResponseEntity.ok(staffLeaveRequestService.getCurrentStaff());
    }

    @GetMapping("/api/staff-leave-requests/roles")
    @ResponseBody
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(staffLeaveRequestService.getRoles());
    }

    @GetMapping("/api/staff-leave-requests/leave-types")
    @ResponseBody
    public ResponseEntity<List<String>> getLeaveTypes() {
        return ResponseEntity.ok(staffLeaveRequestService.getLeaveTypes());
    }

    @GetMapping("/api/staff-leave-requests/staff")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getStaffByRole(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(staffLeaveRequestService.getStaffByRole(role));
    }

    @GetMapping("/api/staff-leave-requests/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLeaveRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(staffLeaveRequestService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/api/staff-leave-requests/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> applyLeaveRequest(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffLeaveRequestService.applyLeave(payload, document);
            response.put("success", true);
            response.put("message", "Leave applied successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to apply leave: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping(value = "/api/staff-leave-requests", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createLeaveRequest(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffLeaveRequestService.createLeave(payload, document);
            response.put("success", true);
            response.put("message", "Leave request saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save leave request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/api/staff-leave-requests/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLeaveRequest(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffLeaveRequestService.updateLeave(id, payload, document);
            response.put("success", true);
            response.put("message", "Leave request updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update leave request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/staff-leave-requests/{id}/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLeaveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffLeaveRequestService.updateLeave(id, payload, null);
            response.put("success", true);
            response.put("message", "Leave request updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update leave request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/staff-leave-requests/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLeaveRequest(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            staffLeaveRequestService.deleteLeave(id);
            response.put("success", true);
            response.put("message", "Leave request deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete leave request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
