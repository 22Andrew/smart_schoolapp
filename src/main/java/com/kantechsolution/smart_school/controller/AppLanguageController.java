package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppLanguageService;
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
public class AppLanguageController {

    private final AppLanguageService appLanguageService;

    @GetMapping({"/admin/language", "/admin/language/", "/admin/language/index"})
    public String page() {
        return "language";
    }

    @GetMapping("/api/languages")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(appLanguageService.listAll());
    }

    @PostMapping("/api/languages")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appLanguageService.create(payload);
            response.put("success", true);
            response.put("message", "Language saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @PutMapping("/api/languages/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appLanguageService.update(id, payload);
            response.put("success", true);
            response.put("message", "Language saved successfully!");
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

    @PostMapping("/api/languages/{id}/activate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> activate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appLanguageService.activate(id);
            response.put("success", true);
            response.put("message", "Active language saved successfully!");
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
