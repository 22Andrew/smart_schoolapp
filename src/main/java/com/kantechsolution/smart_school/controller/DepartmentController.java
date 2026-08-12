package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.DepartmentService;
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
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping("/department")
    public String showDepartmentPage() {
        return "department";
    }

    @GetMapping("/api/departments")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listDepartments() {
        return ResponseEntity.ok(departmentService.listAll());
    }

    @GetMapping("/api/departments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDepartment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(departmentService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/departments")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createDepartment(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = departmentService.createDepartment(payload);
            response.put("success", true);
            response.put("message", "Department saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save department: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/departments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDepartment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = departmentService.updateDepartment(id, payload);
            response.put("success", true);
            response.put("message", "Department updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update department: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/departments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteDepartment(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            departmentService.deleteDepartment(id);
            response.put("success", true);
            response.put("message", "Department deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete department: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
