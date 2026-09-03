package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffPayrollService;
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
public class StaffPayrollController {

    private final StaffPayrollService staffPayrollService;

    @GetMapping("/payroll")
    public String showPayrollPage() {
        return "payroll";
    }

    @GetMapping("/api/payroll/roles")
    @ResponseBody
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(staffPayrollService.getRoles());
    }

    @GetMapping("/api/payroll/months")
    @ResponseBody
    public ResponseEntity<List<Map<String, String>>> getMonths() {
        return ResponseEntity.ok(staffPayrollService.getMonths());
    }

    @GetMapping("/api/payroll/staff")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStaffPayroll(
            @RequestParam(required = false) String role,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(staffPayrollService.searchStaffPayroll(role, month, year));
    }

    @GetMapping("/api/payroll/records/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPayrollRecord(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(staffPayrollService.getPayrollRecord(id));
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/api/payroll/records/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> savePayrollRecord(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffPayrollService.savePayrollRecord(id, body);
            response.put("success", true);
            response.put("message", "Payroll saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save payroll: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/payroll/records/{id}/revert")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> revertPayrollRecord(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> reverted = staffPayrollService.revertPayrollRecord(id);
            response.put("success", true);
            response.put("message", "Payroll reverted successfully!");
            response.put("data", reverted);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to revert payroll: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/payroll/records/{id}/process")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processPayrollRecord(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> processed = staffPayrollService.processPayrollRecord(id, body);
            response.put("success", true);
            response.put("message", "Payroll processed to pay successfully!");
            response.put("data", processed);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to process payroll: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
