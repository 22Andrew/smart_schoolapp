package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseAdmitCardService;
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
public class CbseAdmitCardController {

    private final CbseAdmitCardService cbseAdmitCardService;

    @GetMapping("/cbseexam/cbseadmitcard/admitcard")
    public String showAdmitCardPage() {
        return "cbseexam-cbseadmitcard-admitcard";
    }

    @GetMapping("/api/cbse-admit-cards/exams")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamOptions() {
        return ResponseEntity.ok(cbseAdmitCardService.getExamOptions());
    }

    @GetMapping("/api/cbse-admit-cards/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStudents(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long examId) {
        return ResponseEntity.ok(cbseAdmitCardService.searchStudents(classId, section, examId));
    }

    @GetMapping("/api/cbse-admit-cards/templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        return ResponseEntity.ok(cbseAdmitCardService.getAllTemplates());
    }

    @GetMapping("/api/cbse-admit-cards/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(cbseAdmitCardService.getTemplateById(id));
    }

    @PostMapping("/api/cbse-admit-cards/templates")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createTemplate(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseAdmitCardService.createTemplate(body),
                "Admit card template saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-admit-cards/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTemplate(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseAdmitCardService.updateTemplate(id, body),
                "Admit card template updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-admit-cards/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTemplate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseAdmitCardService.deleteTemplate(id);
            response.put("success", true);
            response.put("message", "Admit card template deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete admit card template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/cbse-admit-cards/templates/{id}/default")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> setDefaultTemplate(@PathVariable Long id) {
        return saveResponse(() -> cbseAdmitCardService.setDefaultTemplate(id),
                "Default admit card template updated!", HttpStatus.OK);
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
            response.put("message", "Failed to save admit card template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
