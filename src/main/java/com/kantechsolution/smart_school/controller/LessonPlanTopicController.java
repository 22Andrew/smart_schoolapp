package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LessonPlanTopicService;
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
public class LessonPlanTopicController {

    private final LessonPlanTopicService lessonPlanTopicService;

    @GetMapping("/lessonplan/topic")
    public String showTopicPage() {
        return "lessonplan-topic";
    }

    @GetMapping("/api/lesson-plan/topics")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTopics() {
        return ResponseEntity.ok(lessonPlanTopicService.getAllTopicRows());
    }

    @GetMapping("/api/lesson-plan/lessons")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getLessons(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long subjectGroupId,
            @RequestParam Long subjectId) {
        return ResponseEntity.ok(lessonPlanTopicService.getLessons(classId, section, subjectGroupId, subjectId));
    }

    @GetMapping("/api/lesson-plan/lessons/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLessonById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(lessonPlanTopicService.getLessonById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/lesson-plan/topics")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveTopics(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = lessonPlanTopicService.saveTopics(payload);
            response.put("success", true);
            response.put("message", "Topic saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save topic: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/lesson-plan/lessons/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLessonTopics(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> updated = lessonPlanTopicService.updateLessonTopics(id, payload);
            response.put("success", true);
            response.put("message", "Topic updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update topic: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/lesson-plan/lessons/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLesson(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            lessonPlanTopicService.deleteLesson(id);
            response.put("success", true);
            response.put("message", "Topic deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete topic: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
