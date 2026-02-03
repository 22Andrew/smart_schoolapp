package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Visitor;
import com.kantechsolution.smart_school.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Visitor operations
 */
@Controller
@RequiredArgsConstructor
public class VisitorController {
    
    private final VisitorService service;
    
    /**
     * Show visitors page
     */
    @GetMapping("/visitors")
    public String showVisitorsPage(Model model) {
        List<Visitor> visitors = service.getAllVisitors();
        model.addAttribute("visitors", visitors);
        return "visitors";
    }
    
    /**
     * Create a new visitor (REST API)
     */
    @PostMapping("/api/visitors")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createVisitor(@RequestBody Visitor visitor) {
        Map<String, Object> response = new HashMap<>();
        try {
            Visitor savedVisitor = service.saveVisitor(visitor);
            response.put("success", true);
            response.put("message", "Visitor record saved successfully!");
            response.put("data", savedVisitor);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save visitor record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all visitors (REST API)
     */
    @GetMapping("/api/visitors")
    @ResponseBody
    public ResponseEntity<List<Visitor>> getAllVisitors() {
        List<Visitor> visitors = service.getAllVisitors();
        return ResponseEntity.ok(visitors);
    }
    
    /**
     * Get visitor by ID (REST API)
     */
    @GetMapping("/api/visitors/{id}")
    @ResponseBody
    public ResponseEntity<Visitor> getVisitorById(@PathVariable Long id) {
        return service.getVisitorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update a visitor (REST API)
     */
    @PutMapping("/api/visitors/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateVisitor(
            @PathVariable Long id, 
            @RequestBody Visitor visitorDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            Visitor updatedVisitor = service.updateVisitor(id, visitorDetails);
            response.put("success", true);
            response.put("message", "Visitor record updated successfully!");
            response.put("data", updatedVisitor);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update visitor record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete a visitor (REST API)
     */
    @DeleteMapping("/api/visitors/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteVisitor(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deleteVisitor(id);
            response.put("success", true);
            response.put("message", "Visitor record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete visitor record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get visitors by date range (REST API)
     */
    @GetMapping("/api/visitors/date-range")
    @ResponseBody
    public ResponseEntity<List<Visitor>> getVisitorsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Visitor> visitors = service.getVisitorsByDateRange(startDate, endDate);
        return ResponseEntity.ok(visitors);
    }
}
