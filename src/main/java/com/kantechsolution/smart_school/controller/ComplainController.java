package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Complain;
import com.kantechsolution.smart_school.service.ComplainService;
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
 * Controller for Complain operations
 */
@Controller
@RequiredArgsConstructor
public class ComplainController {
    
    private final ComplainService service;
    
    /**
     * Show complain page
     */
    @GetMapping("/complain")
    public String showComplainPage(Model model) {
        List<Complain> complains = service.getAllComplains();
        model.addAttribute("complains", complains);
        return "complain";
    }
    
    /**
     * Create a new complain record (REST API)
     */
    @PostMapping("/api/complains")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createComplain(@RequestBody Complain complain) {
        Map<String, Object> response = new HashMap<>();
        try {
            Complain savedComplain = service.saveComplain(complain);
            response.put("success", true);
            response.put("message", "Complain record saved successfully!");
            response.put("data", savedComplain);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save complain record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all complains (REST API)
     */
    @GetMapping("/api/complains")
    @ResponseBody
    public ResponseEntity<List<Complain>> getAllComplains() {
        List<Complain> complains = service.getAllComplains();
        return ResponseEntity.ok(complains);
    }
    
    /**
     * Get complain by ID (REST API)
     */
    @GetMapping("/api/complains/{id}")
    @ResponseBody
    public ResponseEntity<Complain> getComplainById(@PathVariable Long id) {
        return service.getComplainById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update complain (REST API)
     */
    @PutMapping("/api/complains/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateComplain(@PathVariable Long id, @RequestBody Complain complainDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            Complain updatedComplain = service.updateComplain(id, complainDetails);
            response.put("success", true);
            response.put("message", "Complain record updated successfully!");
            response.put("data", updatedComplain);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update complain record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete complain (REST API)
     */
    @DeleteMapping("/api/complains/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteComplain(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deleteComplain(id);
            response.put("success", true);
            response.put("message", "Complain record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete complain record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Search complains by date range (REST API)
     */
    @GetMapping("/api/complains/search/date-range")
    @ResponseBody
    public ResponseEntity<List<Complain>> getComplainsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Complain> complains = service.getComplainsByDateRange(startDate, endDate);
        return ResponseEntity.ok(complains);
    }
    
    /**
     * Search complains by type (REST API)
     */
    @GetMapping("/api/complains/search/type")
    @ResponseBody
    public ResponseEntity<List<Complain>> getComplainsByType(@RequestParam String type) {
        List<Complain> complains = service.getComplainsByType(type);
        return ResponseEntity.ok(complains);
    }
    
    /**
     * Search complains by name (REST API)
     */
    @GetMapping("/api/complains/search/name")
    @ResponseBody
    public ResponseEntity<List<Complain>> searchComplainsByName(@RequestParam String name) {
        List<Complain> complains = service.searchComplainsByName(name);
        return ResponseEntity.ok(complains);
    }
}
