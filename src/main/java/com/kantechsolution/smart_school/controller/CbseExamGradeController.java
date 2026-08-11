package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseExamGradeService;
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
public class CbseExamGradeController {

    private final CbseExamGradeService cbseExamGradeService;

    @GetMapping("/cbseexam/cbsegrade/index")
    public String showCbseExamGradePage() {
        return "cbseexam-cbsegrade-index";
    }

    @GetMapping("/api/cbse-exam-grades")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamGrades() {
        return ResponseEntity.ok(cbseExamGradeService.getAllGrades());
    }

    @GetMapping("/api/cbse-exam-grades/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamGrade(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamGradeService.getGradeById(id));
    }

    @PostMapping("/api/cbse-exam-grades")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createCbseExamGrade(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamGradeService.createGrade(body),
                "Exam grade saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-exam-grades/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCbseExamGrade(@PathVariable Long id,
                                                                   @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamGradeService.updateGrade(id, body),
                "Exam grade updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-exam-grades/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCbseExamGrade(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseExamGradeService.deleteGrade(id);
            response.put("success", true);
            response.put("message", "Exam grade deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete exam grade: " + e.getMessage());
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
