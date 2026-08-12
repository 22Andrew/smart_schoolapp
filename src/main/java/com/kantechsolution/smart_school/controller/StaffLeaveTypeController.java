package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffLeaveTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class StaffLeaveTypeController {

    private final StaffLeaveTypeService staffLeaveTypeService;

    @GetMapping("/staff/leavetypes")
    public String showLeaveTypesPage() {
        return "staff-leavetypes";
    }

    @GetMapping("/api/staff-leave-types")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listLeaveTypes() {
        return ResponseEntity.ok(staffLeaveTypeService.listAll());
    }

    @GetMapping("/api/staff-leave-types/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLeaveType(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(staffLeaveTypeService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/staff-leave-types")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createLeaveType(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffLeaveTypeService.createLeaveType(payload);
            response.put("success", true);
            response.put("message", "Leave type saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save leave type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/staff-leave-types/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLeaveType(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffLeaveTypeService.updateLeaveType(id, payload);
            response.put("success", true);
            response.put("message", "Leave type updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update leave type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/staff-leave-types/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLeaveType(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            staffLeaveTypeService.deleteLeaveType(id);
            response.put("success", true);
            response.put("message", "Leave type deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete leave type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
