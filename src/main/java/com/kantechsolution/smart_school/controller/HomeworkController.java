package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.service.HomeworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HomeworkController {

    private final HomeworkService homeworkService;

    @GetMapping("/homework")
    public String showHomeworkPage(Model model) {
        model.addAttribute("homeworkList", homeworkService.getAllHomework());
        return "homework";
    }

    @GetMapping("/api/homework")
    @ResponseBody
    public ResponseEntity<List<Homework>> searchHomework(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) Long subjectGroupId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(defaultValue = "upcoming") String tab) {
        return ResponseEntity.ok(homeworkService.searchHomework(classId, section, subjectGroupId, subjectId, tab));
    }

    @GetMapping("/api/homework/{id}")
    @ResponseBody
    public ResponseEntity<Homework> getHomeworkById(@PathVariable Long id) {
        return homeworkService.getHomeworkById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/api/homework", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createHomework(
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Homework saved = homeworkService.createHomework(payload, document);
            response.put("success", true);
            response.put("message", "Homework saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save homework: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/api/homework/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateHomework(
            @PathVariable Long id,
            @RequestPart("data") Map<String, Object> payload,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        Map<String, Object> response = new HashMap<>();
        try {
            Homework saved = homeworkService.updateHomework(id, payload, document);
            response.put("success", true);
            response.put("message", "Homework updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update homework: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/homework/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteHomework(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            homeworkService.deleteHomework(id);
            response.put("success", true);
            response.put("message", "Homework deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete homework: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/homework/{id}/evaluation")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getHomeworkEvaluation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", homeworkService.getEvaluationView(id));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to load evaluation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/homework/{id}/evaluation")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveHomeworkEvaluation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = homeworkService.saveEvaluation(id, payload);
            response.put("success", true);
            response.put("message", "Homework evaluation saved successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save evaluation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
