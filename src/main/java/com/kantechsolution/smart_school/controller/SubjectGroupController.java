package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.SubjectGroup;
import com.kantechsolution.smart_school.service.SubjectGroupService;
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
 * Controller for Academics Subject Group page and API
 */
@Controller
public class SubjectGroupController {

    @Autowired
    private SubjectGroupService subjectGroupService;

    @GetMapping("/subjectgroup")
    public String showSubjectGroupPage(Model model) {
        return "subjectgroup";
    }

    @GetMapping("/api/subject-groups")
    @ResponseBody
    public ResponseEntity<List<SubjectGroup>> getAllGroups() {
        try {
            return ResponseEntity.ok(subjectGroupService.getAllGroups());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/subject-groups")
    @ResponseBody
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> payload) {
        try {
            SubjectGroup saved = subjectGroupService.createGroup(
                    asString(payload.get("name")),
                    asLong(payload.get("classId")),
                    asStringList(payload.get("sections")),
                    asLongList(payload.get("subjectIds")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create subject group"));
        }
    }

    @PutMapping("/api/subject-groups/{id}")
    @ResponseBody
    public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            SubjectGroup updated = subjectGroupService.updateGroup(
                    id,
                    asString(payload.get("name")),
                    asLong(payload.get("classId")),
                    asStringList(payload.get("sections")),
                    asLongList(payload.get("subjectIds")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Subject group not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update subject group"));
        }
    }

    @DeleteMapping("/api/subject-groups/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        try {
            subjectGroupService.deleteGroup(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete subject group"));
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.valueOf(String.valueOf(value));
    }

    @SuppressWarnings("unchecked")
    private List<String> asStringList(Object value) {
        if (value == null) {
            return List.of();
        }
        return (List<String>) value;
    }

    @SuppressWarnings("unchecked")
    private List<Long> asLongList(Object value) {
        if (value == null) {
            return List.of();
        }
        List<Object> raw = (List<Object>) value;
        return raw.stream()
                .filter(item -> item != null && !String.valueOf(item).isBlank())
                .map(item -> Long.valueOf(String.valueOf(item)))
                .toList();
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
