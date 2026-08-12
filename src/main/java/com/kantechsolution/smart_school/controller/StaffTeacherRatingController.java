package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffTeacherRatingService;
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
public class StaffTeacherRatingController {

    private final StaffTeacherRatingService staffTeacherRatingService;

    @GetMapping("/staff/rating")
    public String showTeachersRatingPage() {
        return "staff-rating";
    }

    @GetMapping("/api/staff-teacher-ratings")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listRatings() {
        return ResponseEntity.ok(staffTeacherRatingService.listAll());
    }

    @PostMapping("/api/staff-teacher-ratings/{id}/approve")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> approveRating(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = staffTeacherRatingService.approveRating(id);
            response.put("success", true);
            response.put("message", "Rating approved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to approve rating: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/staff-teacher-ratings/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteRating(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            staffTeacherRatingService.deleteRating(id);
            response.put("success", true);
            response.put("message", "Rating deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete rating: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
