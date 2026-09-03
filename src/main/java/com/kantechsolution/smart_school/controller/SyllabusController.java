package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LessonPlanScheduleService;
import com.kantechsolution.smart_school.service.LessonPlanViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SyllabusController {

    private final LessonPlanScheduleService lessonPlanScheduleService;
    private final LessonPlanViewService lessonPlanViewService;

    @GetMapping("/syllabus")
    public String showSyllabusPage() {
        return "syllabus";
    }

    @GetMapping("/api/lesson-plan/schedules")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getSchedules(
            @RequestParam String teacherCode,
            @RequestParam(required = false) String weekStart) {
        try {
            LocalDate start = weekStart == null || weekStart.isBlank()
                    ? null
                    : LocalDate.parse(weekStart);
            return ResponseEntity.ok(lessonPlanScheduleService.getWeeklySchedule(teacherCode, start));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/api/lesson-plan/schedules/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScheduleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(lessonPlanScheduleService.getScheduleById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/lesson-plan/schedules")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createSchedule(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = lessonPlanScheduleService.createSchedule(payload);
            response.put("success", true);
            response.put("message", "Lesson plan saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save lesson plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/lesson-plan/schedules/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateSchedule(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> updated = lessonPlanScheduleService.updateSchedule(id, payload);
            response.put("success", true);
            response.put("message", "Lesson plan updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update lesson plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/lesson-plan/schedules/{id}/view")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScheduleView(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(lessonPlanViewService.getViewData(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/lesson-plan/schedules/{id}/comments")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addScheduleComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = lessonPlanViewService.addComment(id, payload);
            response.put("success", true);
            response.put("message", "Comment added successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to add comment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/lesson-plan/schedules/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteSchedule(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            lessonPlanScheduleService.deleteSchedule(id);
            response.put("success", true);
            response.put("message", "Lesson plan deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete lesson plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
