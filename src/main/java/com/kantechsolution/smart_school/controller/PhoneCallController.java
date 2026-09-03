package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.PhoneCall;
import com.kantechsolution.smart_school.service.PhoneCallService;
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
 * Controller for Phone Call Log operations
 */
@Controller
@RequiredArgsConstructor
public class PhoneCallController {
    
    private final PhoneCallService service;
    
    /**
     * Show phone call log page
     */
    @GetMapping("/phone-call-log")
    public String showPhoneCallLogPage(Model model) {
        List<PhoneCall> phoneCalls = service.getAllPhoneCalls();
        model.addAttribute("phoneCalls", phoneCalls);
        return "phone-call-log";
    }
    
    /**
     * Create a new phone call record (REST API)
     */
    @PostMapping("/api/phone-calls")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createPhoneCall(@RequestBody PhoneCall phoneCall) {
        Map<String, Object> response = new HashMap<>();
        try {
            PhoneCall savedPhoneCall = service.savePhoneCall(phoneCall);
            response.put("success", true);
            response.put("message", "Phone call record saved successfully!");
            response.put("data", savedPhoneCall);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save phone call record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all phone calls (REST API)
     */
    @GetMapping("/api/phone-calls")
    @ResponseBody
    public ResponseEntity<List<PhoneCall>> getAllPhoneCalls() {
        List<PhoneCall> phoneCalls = service.getAllPhoneCalls();
        return ResponseEntity.ok(phoneCalls);
    }
    
    /**
     * Get phone call by ID (REST API)
     */
    @GetMapping("/api/phone-calls/{id}")
    @ResponseBody
    public ResponseEntity<PhoneCall> getPhoneCallById(@PathVariable Long id) {
        return service.getPhoneCallById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update a phone call record (REST API)
     */
    @PutMapping("/api/phone-calls/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updatePhoneCall(
            @PathVariable Long id, 
            @RequestBody PhoneCall phoneCallDetails) {
        Map<String, Object> response = new HashMap<>();
        try {
            PhoneCall updatedPhoneCall = service.updatePhoneCall(id, phoneCallDetails);
            response.put("success", true);
            response.put("message", "Phone call record updated successfully!");
            response.put("data", updatedPhoneCall);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update phone call record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete a phone call record (REST API)
     */
    @DeleteMapping("/api/phone-calls/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deletePhoneCall(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.deletePhoneCall(id);
            response.put("success", true);
            response.put("message", "Phone call record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete phone call record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get phone calls by date range (REST API)
     */
    @GetMapping("/api/phone-calls/date-range")
    @ResponseBody
    public ResponseEntity<List<PhoneCall>> getPhoneCallsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PhoneCall> phoneCalls = service.getPhoneCallsByDateRange(startDate, endDate);
        return ResponseEntity.ok(phoneCalls);
    }
    
    /**
     * Get phone calls by call type (REST API)
     */
    @GetMapping("/api/phone-calls/type/{callType}")
    @ResponseBody
    public ResponseEntity<List<PhoneCall>> getPhoneCallsByType(@PathVariable String callType) {
        List<PhoneCall> phoneCalls = service.getPhoneCallsByType(callType);
        return ResponseEntity.ok(phoneCalls);
    }
    
    /**
     * Search phone calls by name (REST API)
     */
    @GetMapping("/api/phone-calls/search/name")
    @ResponseBody
    public ResponseEntity<List<PhoneCall>> searchPhoneCallsByName(@RequestParam String name) {
        List<PhoneCall> phoneCalls = service.searchPhoneCallsByName(name);
        return ResponseEntity.ok(phoneCalls);
    }
    
    /**
     * Search phone calls by phone (REST API)
     */
    @GetMapping("/api/phone-calls/search/phone")
    @ResponseBody
    public ResponseEntity<List<PhoneCall>> searchPhoneCallsByPhone(@RequestParam String phone) {
        List<PhoneCall> phoneCalls = service.searchPhoneCallsByPhone(phone);
        return ResponseEntity.ok(phoneCalls);
    }
}
