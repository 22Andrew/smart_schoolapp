package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SmsConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SmsConfigController {

    private final SmsConfigService smsConfigService;

    @GetMapping({"/smsconfig", "/smsconfig/"})
    public String page() {
        return "smsconfig";
    }

    @GetMapping("/api/smsconfig")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> list() {
        return ResponseEntity.ok(smsConfigService.list());
    }

    @PostMapping("/api/smsconfig")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = smsConfigService.save(payload);
            response.put("success", true);
            response.put("message", "SMS settings saved successfully!");
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
