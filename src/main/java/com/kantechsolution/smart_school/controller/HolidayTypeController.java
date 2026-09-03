package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.HolidayType;
import com.kantechsolution.smart_school.service.HolidayTypeService;
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
public class HolidayTypeController {

    private final HolidayTypeService holidayTypeService;

    @GetMapping("/holidaytype")
    public String showHolidayTypePage() {
        return "holidaytype";
    }

    @GetMapping("/api/holiday-types")
    @ResponseBody
    public ResponseEntity<List<HolidayType>> getHolidayTypes() {
        return ResponseEntity.ok(holidayTypeService.getAllHolidayTypes());
    }

    @GetMapping("/api/holiday-types/{id}")
    @ResponseBody
    public ResponseEntity<HolidayType> getHolidayTypeById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(holidayTypeService.getHolidayTypeById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/holiday-types")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createHolidayType(@RequestBody HolidayType holidayType) {
        Map<String, Object> response = new HashMap<>();
        try {
            HolidayType saved = holidayTypeService.createHolidayType(holidayType);
            response.put("success", true);
            response.put("message", "Holiday type saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save holiday type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/holiday-types/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateHolidayType(
            @PathVariable Long id,
            @RequestBody HolidayType holidayType) {
        Map<String, Object> response = new HashMap<>();
        try {
            HolidayType updated = holidayTypeService.updateHolidayType(id, holidayType);
            response.put("success", true);
            response.put("message", "Holiday type updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update holiday type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/holiday-types/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteHolidayType(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            holidayTypeService.deleteHolidayType(id);
            response.put("success", true);
            response.put("message", "Holiday type deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete holiday type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
