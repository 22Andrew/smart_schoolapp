package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.AdmissionEnquiry;
import com.kantechsolution.smart_school.service.AdmissionEnquiryService;
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
 * Controller for AdmissionEnquiry operations
 */
@Controller
@RequiredArgsConstructor
public class AdmissionEnquiryController {
    
    private final AdmissionEnquiryService service;
    
    /**
     * Show admission enquiry page
     */
    @GetMapping("/admission-enquiry")
    public String showAdmissionEnquiryPage(Model model) {
        List<AdmissionEnquiry> enquiries = service.getAllEnquiries();
        model.addAttribute("enquiries", enquiries);
        return "admission-enquiry";
    }
    
    /**
     * Create a new admission enquiry (REST API)
     */
    @PostMapping("/api/admission-enquiry")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createEnquiry(@RequestBody AdmissionEnquiry enquiry) {
        Map<String, Object> response = new HashMap<>();
        try {
            AdmissionEnquiry savedEnquiry = service.saveEnquiry(enquiry);
            response.put("success", true);
            response.put("message", "Admission enquiry saved successfully!");
            response.put("data", savedEnquiry);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save admission enquiry: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all admission enquiries (REST API)
     */
    @GetMapping("/api/admission-enquiry")
    @ResponseBody
    public ResponseEntity<List<AdmissionEnquiry>> getAllEnquiries() {
        List<AdmissionEnquiry> enquiries = service.getAllEnquiries();
        return ResponseEntity.ok(enquiries);
    }
    
    /**
     * Get enquiry by ID (REST API)
     */
    @GetMapping("/api/admission-enquiry/{id}")
    @ResponseBody
    public ResponseEntity<AdmissionEnquiry> getEnquiryById(@PathVariable Long id) {
        return service.getEnquiryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update an enquiry (REST API)
     */
    @PutMapping("/api/admission-enquiry/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateEnquiry(
            @PathVariable Long id, 
            @RequestBody AdmissionEnquiry enquiryDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            AdmissionEnquiry updatedEnquiry = service.updateEnquiry(id, enquiryDetails);
            response.put("success", true);
            response.put("message", "Admission enquiry updated successfully!");
            response.put("data", updatedEnquiry);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update admission enquiry: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete an enquiry (REST API)
     */
    @DeleteMapping("/api/admission-enquiry/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteEnquiry(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deleteEnquiry(id);
            response.put("success", true);
            response.put("message", "Admission enquiry deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete admission enquiry: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get enquiries by status (REST API)
     */
    @GetMapping("/api/admission-enquiry/status/{status}")
    @ResponseBody
    public ResponseEntity<List<AdmissionEnquiry>> getEnquiriesByStatus(@PathVariable String status) {
        AdmissionEnquiry.EnquiryStatus enquiryStatus = AdmissionEnquiry.EnquiryStatus.valueOf(status.toUpperCase());
        List<AdmissionEnquiry> enquiries = service.getEnquiriesByStatus(enquiryStatus);
        return ResponseEntity.ok(enquiries);
    }
    
    /**
     * Get enquiries by date range (REST API)
     */
    @GetMapping("/api/admission-enquiry/date-range")
    @ResponseBody
    public ResponseEntity<List<AdmissionEnquiry>> getEnquiriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AdmissionEnquiry> enquiries = service.getEnquiriesByDateRange(startDate, endDate);
        return ResponseEntity.ok(enquiries);
    }
}
