package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.HolidayService;
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
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping("/holiday/index")
    public String showHolidayIndexPage() {
        return "holiday-index";
    }

    @GetMapping("/api/holidays/types")
    @ResponseBody
    public ResponseEntity<List<String>> getHolidayTypes() {
        return ResponseEntity.ok(holidayService.getHolidayTypes());
    }

    @GetMapping("/api/holidays")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchHolidays(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(holidayService.searchHolidays(type));
    }

    @GetMapping("/api/holidays/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getHolidayById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(holidayService.getHolidayById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/holidays")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createHoliday(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = holidayService.createHoliday(payload);
            response.put("success", true);
            response.put("message", "Holiday saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save holiday: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/holidays/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateHoliday(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> updated = holidayService.updateHoliday(id, payload);
            response.put("success", true);
            response.put("message", "Holiday updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update holiday: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/holidays/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteHoliday(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            holidayService.deleteHoliday(id);
            response.put("success", true);
            response.put("message", "Holiday deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete holiday: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
