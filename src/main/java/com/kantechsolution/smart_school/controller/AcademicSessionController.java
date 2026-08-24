package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AcademicSessionService;
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
public class AcademicSessionController {

    private final AcademicSessionService academicSessionService;

    @GetMapping("/sessions")
    public String showSessionsPage() {
        return "sessions";
    }

    @GetMapping("/api/sessions/current")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCurrentSession() {
        return ResponseEntity.ok(academicSessionService.getCurrentSession());
    }

    @PutMapping("/api/sessions/current")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> setCurrentSession(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object idValue = payload.get("id");
            if (idValue == null || String.valueOf(idValue).isBlank()) {
                throw new IllegalArgumentException("Session is required");
            }
            Long id = Long.parseLong(String.valueOf(idValue).trim());
            Map<String, Object> saved = academicSessionService.setCurrentSession(id);
            response.put("success", true);
            response.put("message", "Session updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update session: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/sessions")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getSessions() {
        return ResponseEntity.ok(academicSessionService.getAllSessions());
    }

    @GetMapping("/api/sessions/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(academicSessionService.getSessionById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/sessions")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = academicSessionService.createSession(payload);
            response.put("success", true);
            response.put("message", "Session saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save session: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/sessions/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateSession(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = academicSessionService.updateSession(id, payload);
            response.put("success", true);
            response.put("message", "Session updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update session: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/sessions/{id}/activate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> activateSession(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = academicSessionService.activateSession(id);
            response.put("success", true);
            response.put("message", "Session activated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to activate session: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/sessions/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteSession(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            academicSessionService.deleteSession(id);
            response.put("success", true);
            response.put("message", "Session deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete session: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
