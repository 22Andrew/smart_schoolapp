package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppLanguageService;
import com.kantechsolution.smart_school.service.AppLanguageTranslationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
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
    private final AppLanguageTranslationService appLanguageTranslationService;

    @GetMapping({"/admin/language", "/admin/language/", "/admin/language/index"})
    public String page() {
        return "language";
    }

    @GetMapping("/api/languages/header")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listHeaderLanguages() {
        return ResponseEntity.ok(appLanguageService.listHeaderLanguages());
    }

    @GetMapping("/api/languages/active")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> activeLanguage() {
        return ResponseEntity.ok(appLanguageService.getActiveLanguageMap());
    }

    @GetMapping("/api/languages/phrases")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> phrases() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> active = appLanguageService.getActiveLanguageMap();
        response.put("languageCode", active.get("shortCode"));
        response.put("isRtl", active.get("isRtl"));
        response.put("phraseCount", appLanguageTranslationService.getPhraseCount());
        response.put("phrases", appLanguageTranslationService.getPhrasesForActiveLanguage());
        return ResponseEntity.ok(response);
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
    public ResponseEntity<Map<String, Object>> activate(@PathVariable Long id, HttpSession session, HttpServletResponse response) {
        Map<String, Object> body = new HashMap<>();
        try {
            Map<String, Object> saved = appLanguageService.activate(id);
            session.setAttribute("activeLanguageId", saved.get("id"));
            session.setAttribute("activeLanguageCode", saved.get("shortCode"));
            session.setAttribute("activeLanguageRtl", saved.get("isRtl"));
            Cookie cookie = new Cookie("smart_school_lang", String.valueOf(saved.get("shortCode")).toLowerCase());
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60 * 24 * 365);
            cookie.setHttpOnly(false);
            response.addCookie(cookie);
            body.put("success", true);
            body.put("message", "Active language saved successfully!");
            body.put("data", saved);
            body.put("phrases", appLanguageTranslationService.getPhrasesForLanguage(String.valueOf(saved.get("shortCode"))));
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }
}
