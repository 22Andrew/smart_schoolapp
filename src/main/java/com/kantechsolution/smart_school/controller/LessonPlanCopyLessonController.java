package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LessonPlanCopyLessonService;
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
public class LessonPlanCopyLessonController {

    private final LessonPlanCopyLessonService copyLessonService;

    @GetMapping("/lessonplan/copylesson")
    public String showCopyLessonPage() {
        return "lessonplan-copylesson";
    }

    @GetMapping("/api/lesson-plan/copy-lessons/search")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchOldLessons(
            @RequestParam String sessionName,
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long subjectGroupId,
            @RequestParam Long subjectId) {
        try {
            return ResponseEntity.ok(copyLessonService.searchOldLessons(
                    sessionName, classId, section, subjectGroupId, subjectId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @PostMapping("/api/lesson-plan/copy-lessons")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> copyLessons(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = copyLessonService.copyLessons(payload);
            response.put("success", true);
            response.put("message", result.get("copiedCount") + " lesson(s) copied to "
                    + result.get("currentSession") + ".");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to copy lessons: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
