package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.DesignationService;
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
public class DesignationController {

    private final DesignationService designationService;

    @GetMapping("/designation")
    public String showDesignationPage() {
        return "designation";
    }

    @GetMapping("/api/designations")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listDesignations() {
        return ResponseEntity.ok(designationService.listAll());
    }

    @GetMapping("/api/designations/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDesignation(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(designationService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/designations")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createDesignation(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = designationService.createDesignation(payload);
            response.put("success", true);
            response.put("message", "Designation saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save designation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/designations/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDesignation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = designationService.updateDesignation(id, payload);
            response.put("success", true);
            response.put("message", "Designation updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update designation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/designations/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteDesignation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            designationService.deleteDesignation(id);
            response.put("success", true);
            response.put("message", "Designation deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete designation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
