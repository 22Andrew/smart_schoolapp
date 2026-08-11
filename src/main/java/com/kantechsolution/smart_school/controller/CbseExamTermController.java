package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseExamTermService;
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
public class CbseExamTermController {

    private final CbseExamTermService cbseExamTermService;

    @GetMapping("/cbseexam/cbseterm/index")
    public String showCbseExamTermPage() {
        return "cbseexam-cbseterm-index";
    }

    @GetMapping("/api/cbse-exam-terms")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamTerms() {
        return ResponseEntity.ok(cbseExamTermService.getAllTerms());
    }

    @GetMapping("/api/cbse-exam-terms/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamTerm(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamTermService.getTermById(id));
    }

    @PostMapping("/api/cbse-exam-terms")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createCbseExamTerm(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamTermService.createTerm(body),
                "Term saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-exam-terms/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCbseExamTerm(@PathVariable Long id,
                                                                 @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamTermService.updateTerm(id, body),
                "Term updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-exam-terms/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCbseExamTerm(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseExamTermService.deleteTerm(id);
            response.put("success", true);
            response.put("message", "Term deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete term: " + e.getMessage());
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
