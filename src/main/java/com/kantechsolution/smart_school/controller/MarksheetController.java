package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.MarksheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MarksheetController {

    private final MarksheetService marksheetService;

    @GetMapping("/emarksheet")
    public String showDesignMarksheetPage() {
        return "emarksheet";
    }

    @GetMapping("/api/marksheets/templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        return ResponseEntity.ok(marksheetService.getAllTemplates());
    }

    @GetMapping("/api/marksheets/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(marksheetService.getTemplateById(id));
    }

    @PostMapping("/api/marksheets/templates")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createTemplate(
            @RequestPart("payload") Map<String, Object> payload,
            @RequestPart(value = "headerImage", required = false) MultipartFile headerImage,
            @RequestPart(value = "leftLogo", required = false) MultipartFile leftLogo,
            @RequestPart(value = "leftSign", required = false) MultipartFile leftSign,
            @RequestPart(value = "middleSign", required = false) MultipartFile middleSign,
            @RequestPart(value = "rightSign", required = false) MultipartFile rightSign,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage) {
        return saveResponse(() -> marksheetService.createTemplate(payload, headerImage, leftLogo, leftSign, middleSign, rightSign, backgroundImage),
                "Marksheet template saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/marksheets/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTemplate(
            @PathVariable Long id,
            @RequestPart("payload") Map<String, Object> payload,
            @RequestPart(value = "headerImage", required = false) MultipartFile headerImage,
            @RequestPart(value = "leftLogo", required = false) MultipartFile leftLogo,
            @RequestPart(value = "leftSign", required = false) MultipartFile leftSign,
            @RequestPart(value = "middleSign", required = false) MultipartFile middleSign,
            @RequestPart(value = "rightSign", required = false) MultipartFile rightSign,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage) {
        return saveResponse(() -> marksheetService.updateTemplate(id, payload, headerImage, leftLogo, leftSign, middleSign, rightSign, backgroundImage),
                "Marksheet template updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/marksheets/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTemplate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            marksheetService.deleteTemplate(id);
            response.put("success", true);
            response.put("message", "Marksheet template deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete marksheet template: " + e.getMessage());
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
            response.put("message", "Failed to save marksheet template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
