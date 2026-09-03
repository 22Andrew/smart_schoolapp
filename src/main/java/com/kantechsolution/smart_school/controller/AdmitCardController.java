package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AdmitCardService;
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
public class AdmitCardController {

    private final AdmitCardService admitCardService;

    @GetMapping("/admitcard")
    public String showDesignAdmitCardPage() {
        return "admitcard";
    }

    @GetMapping("/api/admit-cards/templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTemplates() {
        return ResponseEntity.ok(admitCardService.getAllTemplates());
    }

    @GetMapping("/api/admit-cards/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(admitCardService.getTemplateById(id));
    }

    @PostMapping("/api/admit-cards/templates")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createTemplate(
            @RequestPart("payload") Map<String, Object> payload,
            @RequestPart(value = "leftLogo", required = false) MultipartFile leftLogo,
            @RequestPart(value = "rightLogo", required = false) MultipartFile rightLogo,
            @RequestPart(value = "signImage", required = false) MultipartFile signImage,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage) {
        return saveResponse(() -> admitCardService.createTemplate(payload, leftLogo, rightLogo, signImage, backgroundImage),
                "Admit card template saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/admit-cards/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateTemplate(
            @PathVariable Long id,
            @RequestPart("payload") Map<String, Object> payload,
            @RequestPart(value = "leftLogo", required = false) MultipartFile leftLogo,
            @RequestPart(value = "rightLogo", required = false) MultipartFile rightLogo,
            @RequestPart(value = "signImage", required = false) MultipartFile signImage,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage) {
        return saveResponse(() -> admitCardService.updateTemplate(id, payload, leftLogo, rightLogo, signImage, backgroundImage),
                "Admit card template updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/admit-cards/templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteTemplate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            admitCardService.deleteTemplate(id);
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

    @PutMapping("/api/admit-cards/templates/{id}/default")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> setDefaultTemplate(@PathVariable Long id) {
        return saveResponse(() -> admitCardService.setDefaultTemplate(id),
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
