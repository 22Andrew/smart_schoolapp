package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.service.SchoolClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Academics Class page and API
 */
@Controller
public class ClassController {

    @Autowired
    private SchoolClassService schoolClassService;

    @GetMapping("/classes")
    public String showClassesPage(Model model) {
        return "classes";
    }

    @GetMapping("/api/classes")
    @ResponseBody
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        try {
            return ResponseEntity.ok(schoolClassService.getAllClasses());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/classes")
    @ResponseBody
    public ResponseEntity<?> createClass(@RequestBody Map<String, Object> payload) {
        try {
            String name = payload.get("name") == null ? null : String.valueOf(payload.get("name"));
            @SuppressWarnings("unchecked")
            List<String> sections = (List<String>) payload.get("sections");
            SchoolClass saved = schoolClassService.createClass(name, sections);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create class"));
        }
    }

    @PutMapping("/api/classes/{id}")
    @ResponseBody
    public ResponseEntity<?> updateClass(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String name = payload.get("name") == null ? null : String.valueOf(payload.get("name"));
            @SuppressWarnings("unchecked")
            List<String> sections = (List<String>) payload.get("sections");
            SchoolClass updated = schoolClassService.updateClass(id, name, sections);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Class not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update class"));
        }
    }

    @DeleteMapping("/api/classes/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        try {
            schoolClassService.deleteClass(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete class"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
