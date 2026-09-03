package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Hostel;
import com.kantechsolution.smart_school.service.HostelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Page and API for Hostel management.
 */
@Controller
public class HostelController {

    @Autowired
    private HostelService hostelService;

    @GetMapping("/hostel")
    public String showHostelPage(Model model) {
        return "hostel";
    }

    @GetMapping("/api/hostels")
    @ResponseBody
    public ResponseEntity<List<Hostel>> getAllHostels() {
        try {
            return ResponseEntity.ok(hostelService.getAllHostels());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/hostels")
    @ResponseBody
    public ResponseEntity<?> createHostel(@RequestBody Map<String, Object> payload) {
        try {
            Hostel saved = hostelService.createHostel(
                    asString(payload.get("hostelName")),
                    asString(payload.get("type")),
                    asString(payload.get("address")),
                    asString(payload.get("intake")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create hostel"));
        }
    }

    @PutMapping("/api/hostels/{id}")
    @ResponseBody
    public ResponseEntity<?> updateHostel(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Hostel updated = hostelService.updateHostel(
                    id,
                    asString(payload.get("hostelName")),
                    asString(payload.get("type")),
                    asString(payload.get("address")),
                    asString(payload.get("intake")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Hostel not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update hostel"));
        }
    }

    @DeleteMapping("/api/hostels/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteHostel(@PathVariable Long id) {
        try {
            hostelService.deleteHostel(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete hostel"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
