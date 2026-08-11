package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.MarksGradeService;
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
public class MarksGradeController {

    private final MarksGradeService marksGradeService;

    @GetMapping("/grade")
    public String showMarksGradePage() {
        return "grade";
    }

    @GetMapping("/api/marks-grades/exam-types")
    @ResponseBody
    public ResponseEntity<List<String>> getExamTypes() {
        return ResponseEntity.ok(marksGradeService.getExamTypes());
    }

    @GetMapping("/api/marks-grades")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getGrades() {
        return ResponseEntity.ok(marksGradeService.getAllGrades());
    }

    @GetMapping("/api/marks-grades/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getGrade(@PathVariable Long id) {
        return ResponseEntity.ok(marksGradeService.getGradeById(id));
    }

    @PostMapping("/api/marks-grades")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createGrade(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> marksGradeService.createGrade(body),
                "Marks grade saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/marks-grades/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateGrade(@PathVariable Long id,
                                                           @RequestBody Map<String, Object> body) {
        return saveResponse(() -> marksGradeService.updateGrade(id, body),
                "Marks grade updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/marks-grades/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteGrade(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            marksGradeService.deleteGrade(id);
            response.put("success", true);
            response.put("message", "Marks grade deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete marks grade: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> saveResponse(SaveAction action, String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.run();
            response.put("success", true);
            response.put("message", message);
            response.put("data", data);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save marks grade: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
