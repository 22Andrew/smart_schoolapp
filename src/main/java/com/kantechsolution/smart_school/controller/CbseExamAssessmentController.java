package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseExamAssessmentService;
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
public class CbseExamAssessmentController {

    private final CbseExamAssessmentService cbseExamAssessmentService;

    @GetMapping("/cbseexam/cbseassessment/index")
    public String showCbseExamAssessmentPage() {
        return "cbseexam-cbseassessment-index";
    }

    @GetMapping("/api/cbse-exam-assessments")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamAssessments() {
        return ResponseEntity.ok(cbseExamAssessmentService.getAllAssessments());
    }

    @GetMapping("/api/cbse-exam-assessments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamAssessment(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamAssessmentService.getAssessmentById(id));
    }

    @PostMapping("/api/cbse-exam-assessments")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createCbseExamAssessment(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamAssessmentService.createAssessment(body),
                "Assessment saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-exam-assessments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCbseExamAssessment(@PathVariable Long id,
                                                                        @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamAssessmentService.updateAssessment(id, body),
                "Assessment updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-exam-assessments/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCbseExamAssessment(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseExamAssessmentService.deleteAssessment(id);
            response.put("success", true);
            response.put("message", "Assessment deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete assessment: " + e.getMessage());
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
