package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Subject;
import com.kantechsolution.smart_school.service.SubjectService;
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
 * Controller for Academics Subjects page and API
 */
@Controller
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping("/subject")
    public String showSubjectPage(Model model) {
        return "subject";
    }

    @GetMapping("/api/subjects")
    @ResponseBody
    public ResponseEntity<List<Subject>> getAllSubjects() {
        try {
            return ResponseEntity.ok(subjectService.getAllSubjects());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/subjects")
    @ResponseBody
    public ResponseEntity<?> createSubject(@RequestBody Map<String, String> payload) {
        try {
            Subject saved = subjectService.createSubject(
                    payload.get("name"),
                    payload.get("subjectCode"),
                    payload.get("subjectType")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create subject"));
        }
    }

    @PutMapping("/api/subjects/{id}")
    @ResponseBody
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            Subject updated = subjectService.updateSubject(
                    id,
                    payload.get("name"),
                    payload.get("subjectCode"),
                    payload.get("subjectType")
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Subject not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update subject"));
        }
    }

    @DeleteMapping("/api/subjects/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete subject"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
