package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.PostalReceive;
import com.kantechsolution.smart_school.service.PostalReceiveService;
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
 * Controller for Postal Receive operations
 */
@Controller
@RequiredArgsConstructor
public class PostalReceiveController {
    
    private final PostalReceiveService service;
    
    /**
     * Show postal receive page
     */
    @GetMapping("/receive")
    public String showPostalReceivePage(Model model) {
        List<PostalReceive> postalReceives = service.getAllPostalReceives();
        model.addAttribute("postalReceives", postalReceives);
        return "postal-receive";
    }
    
    /**
     * Create a new postal receive record (REST API)
     */
    @PostMapping("/api/postal-receive")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createPostalReceive(@RequestBody PostalReceive postalReceive) {
        Map<String, Object> response = new HashMap<>();
        try {
            PostalReceive savedPostalReceive = service.savePostalReceive(postalReceive);
            response.put("success", true);
            response.put("message", "Postal receive record saved successfully!");
            response.put("data", savedPostalReceive);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save postal receive record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all postal receives (REST API)
     */
    @GetMapping("/api/postal-receive")
    @ResponseBody
    public ResponseEntity<List<PostalReceive>> getAllPostalReceives() {
        List<PostalReceive> postalReceives = service.getAllPostalReceives();
        return ResponseEntity.ok(postalReceives);
    }
    
    /**
     * Get postal receive by ID (REST API)
     */
    @GetMapping("/api/postal-receive/{id}")
    @ResponseBody
    public ResponseEntity<PostalReceive> getPostalReceiveById(@PathVariable Long id) {
        return service.getPostalReceiveById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update a postal receive record (REST API)
     */
    @PutMapping("/api/postal-receive/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updatePostalReceive(
            @PathVariable Long id,
            @RequestBody PostalReceive postalReceive) {
        Map<String, Object> response = new HashMap<>();
        try {
            PostalReceive updatedPostalReceive = service.updatePostalReceive(id, postalReceive);
            response.put("success", true);
            response.put("message", "Postal receive record updated successfully!");
            response.put("data", updatedPostalReceive);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update postal receive record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete a postal receive record (REST API)
     */
    @DeleteMapping("/api/postal-receive/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deletePostalReceive(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deletePostalReceive(id);
            response.put("success", true);
            response.put("message", "Postal receive record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete postal receive record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get postal receives by date range (REST API)
     */
    @GetMapping("/api/postal-receive/date-range")
    @ResponseBody
    public ResponseEntity<List<PostalReceive>> getPostalReceivesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PostalReceive> postalReceives = service.getPostalReceivesByDateRange(startDate, endDate);
        return ResponseEntity.ok(postalReceives);
    }
    
    /**
     * Search postal receives by reference number (REST API)
     */
    @GetMapping("/api/postal-receive/search/reference")
    @ResponseBody
    public ResponseEntity<List<PostalReceive>> searchByReferenceNo(@RequestParam String referenceNo) {
        List<PostalReceive> postalReceives = service.searchByReferenceNo(referenceNo);
        return ResponseEntity.ok(postalReceives);
    }
    
    /**
     * Search postal receives by from title (REST API)
     */
    @GetMapping("/api/postal-receive/search/from-title")
    @ResponseBody
    public ResponseEntity<List<PostalReceive>> searchByFromTitle(@RequestParam String fromTitle) {
        List<PostalReceive> postalReceives = service.searchByFromTitle(fromTitle);
        return ResponseEntity.ok(postalReceives);
    }
    
    /**
     * Search postal receives by to title (REST API)
     */
    @GetMapping("/api/postal-receive/search/to-title")
    @ResponseBody
    public ResponseEntity<List<PostalReceive>> searchByToTitle(@RequestParam String toTitle) {
        List<PostalReceive> postalReceives = service.searchByToTitle(toTitle);
        return ResponseEntity.ok(postalReceives);
    }
}
