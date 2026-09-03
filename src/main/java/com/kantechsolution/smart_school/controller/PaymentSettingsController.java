package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.PaymentSettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class PaymentSettingsController {

    private final PaymentSettingsService paymentSettingsService;

    public PaymentSettingsController(PaymentSettingsService paymentSettingsService) {
        this.paymentSettingsService = paymentSettingsService;
    }

    @GetMapping({
            "/admin/paymentsettings",
            "/admin/paymentsettings/",
            "/admin/paymentsettings/index"
    })
    public String page() {
        return "paymentsettings";
    }

    @GetMapping("/api/paymentsettings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> list() {
        return ResponseEntity.ok(paymentSettingsService.list());
    }

    @PostMapping("/api/paymentsettings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveGateway(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = paymentSettingsService.saveGateway(payload);
            response.put("success", true);
            response.put("message", "Payment settings saved successfully!");
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

    @PostMapping("/api/paymentsettings/active")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveActive(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = paymentSettingsService.saveActive(payload);
            response.put("success", true);
            response.put("message", "Payment gateway saved successfully!");
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
