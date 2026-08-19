package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.WhatsappConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class WhatsappConfigController {

    private final WhatsappConfigService whatsappConfigService;

    @GetMapping({"/whatsappconfig", "/whatsappconfig/index"})
    public String page() {
        return "whatsappconfig";
    }

    @GetMapping("/api/whatsappconfig")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(whatsappConfigService.getConfig());
    }

    @PostMapping("/api/whatsappconfig")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = whatsappConfigService.save(payload);
            response.put("success", true);
            response.put("message", "WhatsApp settings saved successfully!");
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
