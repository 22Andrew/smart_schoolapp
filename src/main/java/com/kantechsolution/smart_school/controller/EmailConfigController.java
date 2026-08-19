package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.EmailConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class EmailConfigController {

    private final EmailConfigService emailConfigService;

    @GetMapping({"/emailconfig", "/emailconfig/"})
    public String page() {
        return "emailconfig";
    }

    @GetMapping("/api/emailconfig")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(emailConfigService.getConfig());
    }

    @PostMapping("/api/emailconfig")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = emailConfigService.save(payload);
            response.put("success", true);
            response.put("message", "Email settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
