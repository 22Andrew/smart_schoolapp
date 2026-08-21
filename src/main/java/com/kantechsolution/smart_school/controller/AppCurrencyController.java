package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppCurrencyService;
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
public class AppCurrencyController {

    private final AppCurrencyService appCurrencyService;

    @GetMapping({"/admin/currency", "/admin/currency/", "/admin/currency/index"})
    public String page() {
        return "currency";
    }

    @GetMapping("/api/currencies")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(appCurrencyService.listAll());
    }

    @GetMapping("/api/currencies/active")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> activeConfig() {
        return ResponseEntity.ok(appCurrencyService.getActiveConfig());
    }

    @PutMapping("/api/currencies/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appCurrencyService.update(id, payload);
            response.put("success", true);
            response.put("message", "Currency saved successfully!");
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

    @PostMapping("/api/currencies/{id}/base")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> setBase(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appCurrencyService.setBase(id);
            response.put("success", true);
            response.put("message", "Base currency saved successfully!");
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

    @PostMapping("/api/currencies/{id}/activate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> activate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appCurrencyService.activate(id);
            response.put("success", true);
            response.put("message", "Active currency saved successfully!");
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
