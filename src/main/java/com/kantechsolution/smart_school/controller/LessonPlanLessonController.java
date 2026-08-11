package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LessonPlanLessonService;
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
public class LessonPlanLessonController {

    private final LessonPlanLessonService lessonPlanLessonService;

    @GetMapping("/lesson")
    public String showLessonPage() {
        return "lessonplan-lesson";
    }

    @GetMapping("/api/lesson-plan/lesson-groups")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getLessonGroups() {
        return ResponseEntity.ok(lessonPlanLessonService.getAllLessonGroupRows());
    }

    @GetMapping("/api/lesson-plan/lesson-groups/detail")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLessonGroupDetail(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long subjectGroupId,
            @RequestParam Long subjectId) {
        try {
            return ResponseEntity.ok(lessonPlanLessonService.getLessonGroup(
                    classId, section, subjectGroupId, subjectId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/lesson-plan/lesson-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveLessons(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = lessonPlanLessonService.saveLessons(payload);
            response.put("success", true);
            response.put("message", "Lesson saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save lesson: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/lesson-plan/lesson-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLessonGroup(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> updated = lessonPlanLessonService.updateLessonGroup(payload);
            response.put("success", true);
            response.put("message", "Lesson updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update lesson: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/lesson-plan/lesson-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLessonGroup(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long subjectGroupId,
            @RequestParam Long subjectId) {
        Map<String, Object> response = new HashMap<>();
        try {
            lessonPlanLessonService.deleteLessonGroup(classId, section, subjectGroupId, subjectId);
            response.put("success", true);
            response.put("message", "Lesson deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete lesson: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
