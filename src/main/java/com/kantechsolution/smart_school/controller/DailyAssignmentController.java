package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.DailyAssignment;
import com.kantechsolution.smart_school.service.DailyAssignmentService;
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

@Controller
@RequiredArgsConstructor
public class DailyAssignmentController {

    private final DailyAssignmentService dailyAssignmentService;

    @GetMapping("/dailyassignment")
    public String showDailyAssignmentPage(Model model) {
        model.addAttribute("assignments", dailyAssignmentService.getAllAssignments());
        return "dailyassignment";
    }

    @GetMapping("/api/daily-assignments")
    @ResponseBody
    public ResponseEntity<?> searchAssignments(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) Long subjectGroupId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate assignmentDate) {
        try {
            return ResponseEntity.ok(dailyAssignmentService.searchAssignments(
                    classId, section, subjectGroupId, subjectId, assignmentDate));
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/daily-assignments/{id}")
    @ResponseBody
    public ResponseEntity<DailyAssignment> getAssignmentById(@PathVariable Long id) {
        return dailyAssignmentService.getAssignmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/daily-assignments")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createAssignment(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            DailyAssignment saved = dailyAssignmentService.createAssignment(payload);
            response.put("success", true);
            response.put("message", "Daily assignment saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save daily assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/daily-assignments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateAssignment(@PathVariable Long id,
                                                                @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            DailyAssignment saved = dailyAssignmentService.updateAssignment(id, payload);
            response.put("success", true);
            response.put("message", "Daily assignment updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update daily assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/daily-assignments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteAssignment(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            dailyAssignmentService.deleteAssignment(id);
            response.put("success", true);
            response.put("message", "Daily assignment deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete daily assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
