package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.SchoolSection;
import com.kantechsolution.smart_school.service.SchoolSectionService;
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
 * Controller for Academics Sections page and API
 */
@Controller
public class SectionController {

    @Autowired
    private SchoolSectionService schoolSectionService;

    @GetMapping("/sections")
    public String showSectionsPage(Model model) {
        return "sections";
    }

    @GetMapping("/api/sections")
    @ResponseBody
    public ResponseEntity<List<SchoolSection>> getAllSections() {
        try {
            return ResponseEntity.ok(schoolSectionService.getAllSections());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/sections")
    @ResponseBody
    public ResponseEntity<?> createSection(@RequestBody Map<String, String> payload) {
        try {
            SchoolSection saved = schoolSectionService.createSection(payload.get("sectionName"));
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create section"));
        }
    }

    @PutMapping("/api/sections/{id}")
    @ResponseBody
    public ResponseEntity<?> updateSection(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            SchoolSection updated = schoolSectionService.updateSection(id, payload.get("sectionName"));
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Section not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update section"));
        }
    }

    @DeleteMapping("/api/sections/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteSection(@PathVariable Long id) {
        try {
            schoolSectionService.deleteSection(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete section"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
