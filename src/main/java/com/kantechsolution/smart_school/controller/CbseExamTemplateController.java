package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseExamTemplateService;
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
public class CbseExamTemplateController {

    private final CbseExamTemplateService cbseExamTemplateService;

    @GetMapping("/cbseexam/template")
    public String showTemplatePage() {
        return "cbseexam-template";
    }

    @GetMapping("/api/cbse-exam-templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        return ResponseEntity.ok(cbseExamTemplateService.getAllTemplates());
    }

    @GetMapping("/api/cbse-exam-templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamTemplateService.getTemplateById(id));
    }

    @PostMapping("/api/cbse-exam-templates")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createTemplate(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamTemplateService.createTemplate(body),
                "Template saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-exam-templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTemplate(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamTemplateService.updateTemplate(id, body),
                "Template updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-exam-templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTemplate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseExamTemplateService.deleteTemplate(id);
            response.put("success", true);
            response.put("message", "Template deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/api/cbse-exam-templates/{id}/preview")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getTemplatePreview(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamTemplateService.getTemplatePreview(id));
    }

    @GetMapping("/api/cbse-exam-templates/{id}/link-exam")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLinkExamData(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamTemplateService.getLinkExamData(id));
    }

    @PutMapping("/api/cbse-exam-templates/{id}/link-exam")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveLinkedExam(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamTemplateService.saveLinkedExam(id, body),
                "Exam linked successfully!", HttpStatus.OK);
    }

    @GetMapping("/api/cbse-exam-templates/{id}/ranks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getRankData(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamTemplateService.getRankData(id));
    }

    @PostMapping("/api/cbse-exam-templates/{id}/generate-rank")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> generateRank(@PathVariable Long id) {
        try {
            Map<String, Object> data = cbseExamTemplateService.generateRank(id);
            data.put("success", true);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate rank: " + e.getMessage());
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
            response.put("message", "Request failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
