package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.PostalDispatch;
import com.kantechsolution.smart_school.service.PostalDispatchService;
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
 * Controller for Postal Dispatch operations
 */
@Controller
@RequiredArgsConstructor
public class PostalDispatchController {
    
    private final PostalDispatchService service;
    
    /**
     * Show postal dispatch page
     */
    @GetMapping("/dispatch")
    public String showPostalDispatchPage(Model model) {
        List<PostalDispatch> postalDispatches = service.getAllPostalDispatches();
        model.addAttribute("postalDispatches", postalDispatches);
        return "postal-dispatch";
    }
    
    /**
     * Create a new postal dispatch record (REST API)
     */
    @PostMapping("/api/postal-dispatch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createPostalDispatch(@RequestBody PostalDispatch postalDispatch) {
        Map<String, Object> response = new HashMap<>();
        try {
            PostalDispatch savedPostalDispatch = service.savePostalDispatch(postalDispatch);
            response.put("success", true);
            response.put("message", "Postal dispatch record saved successfully!");
            response.put("data", savedPostalDispatch);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save postal dispatch record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all postal dispatches (REST API)
     */
    @GetMapping("/api/postal-dispatch")
    @ResponseBody
    public ResponseEntity<List<PostalDispatch>> getAllPostalDispatches() {
        List<PostalDispatch> postalDispatches = service.getAllPostalDispatches();
        return ResponseEntity.ok(postalDispatches);
    }
    
    /**
     * Get postal dispatch by ID (REST API)
     */
    @GetMapping("/api/postal-dispatch/{id}")
    @ResponseBody
    public ResponseEntity<PostalDispatch> getPostalDispatchById(@PathVariable Long id) {
        return service.getPostalDispatchById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update a postal dispatch record (REST API)
     */
    @PutMapping("/api/postal-dispatch/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updatePostalDispatch(
            @PathVariable Long id,
            @RequestBody PostalDispatch postalDispatch) {
        Map<String, Object> response = new HashMap<>();
        try {
            PostalDispatch updatedPostalDispatch = service.updatePostalDispatch(id, postalDispatch);
            response.put("success", true);
            response.put("message", "Postal dispatch record updated successfully!");
            response.put("data", updatedPostalDispatch);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update postal dispatch record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete a postal dispatch record (REST API)
     */
    @DeleteMapping("/api/postal-dispatch/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deletePostalDispatch(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deletePostalDispatch(id);
            response.put("success", true);
            response.put("message", "Postal dispatch record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete postal dispatch record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get postal dispatches by date range (REST API)
     */
    @GetMapping("/api/postal-dispatch/date-range")
    @ResponseBody
    public ResponseEntity<List<PostalDispatch>> getPostalDispatchesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PostalDispatch> postalDispatches = service.getPostalDispatchesByDateRange(startDate, endDate);
        return ResponseEntity.ok(postalDispatches);
    }
    
    /**
     * Search postal dispatches by reference number (REST API)
     */
    @GetMapping("/api/postal-dispatch/search/reference")
    @ResponseBody
    public ResponseEntity<List<PostalDispatch>> searchByReferenceNo(@RequestParam String referenceNo) {
        List<PostalDispatch> postalDispatches = service.searchByReferenceNo(referenceNo);
        return ResponseEntity.ok(postalDispatches);
    }
    
    /**
     * Search postal dispatches by to title (REST API)
     */
    @GetMapping("/api/postal-dispatch/search/to-title")
    @ResponseBody
    public ResponseEntity<List<PostalDispatch>> searchByToTitle(@RequestParam String toTitle) {
        List<PostalDispatch> postalDispatches = service.searchByToTitle(toTitle);
        return ResponseEntity.ok(postalDispatches);
    }
    
    /**
     * Search postal dispatches by from title (REST API)
     */
    @GetMapping("/api/postal-dispatch/search/from-title")
    @ResponseBody
    public ResponseEntity<List<PostalDispatch>> searchByFromTitle(@RequestParam String fromTitle) {
        List<PostalDispatch> postalDispatches = service.searchByFromTitle(fromTitle);
        return ResponseEntity.ok(postalDispatches);
    }
}
