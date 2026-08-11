package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.ExamGroup;
import com.kantechsolution.smart_school.service.ExamGroupService;
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
public class ExamGroupController {

    private final ExamGroupService examGroupService;

    @GetMapping("/examgroup")
    public String showExamGroupPage() {
        return "examgroup";
    }

    @GetMapping("/api/exam-groups")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamGroups() {
        return ResponseEntity.ok(examGroupService.getAllExamGroups());
    }

    @GetMapping("/api/exam-groups/types")
    @ResponseBody
    public ResponseEntity<List<String>> getExamTypes() {
        return ResponseEntity.ok(examGroupService.getExamTypes());
    }

    @GetMapping("/api/exam-groups/{id}/exams")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamsByGroup(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(examGroupService.getExamsByGroupId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/api/exam-groups")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createExamGroup(@RequestBody ExamGroup examGroup) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupService.saveExamGroup(examGroup);
            response.put("success", true);
            response.put("message", "Exam group saved successfully!");
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save exam group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/exam-groups/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateExamGroup(@PathVariable Long id, @RequestBody ExamGroup examGroup) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupService.updateExamGroup(id, examGroup);
            response.put("success", true);
            response.put("message", "Exam group updated successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update exam group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/exam-groups/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteExamGroup(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            examGroupService.deleteExamGroup(id);
            response.put("success", true);
            response.put("message", "Exam group deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete exam group: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/exam-groups/{id}/exams")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addExamToGroup(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = examGroupService.addExamToGroup(id, body.get("name"));
            response.put("success", true);
            response.put("message", "Exam added successfully!");
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to add exam: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
