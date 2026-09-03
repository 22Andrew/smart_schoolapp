package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.FeesForwardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Fees Carry Forward page and API.
 */
@Controller
public class FeesForwardController {

    @Autowired
    private FeesForwardService feesForwardService;

    @GetMapping({"/feesforward/index", "/feesforward"})
    public String showFeesForwardPage(Model model) {
        return "feesforward";
    }

    @GetMapping("/api/fees-forward")
    @ResponseBody
    public ResponseEntity<?> search(
            @RequestParam Long classId,
            @RequestParam String section
    ) {
        try {
            List<Map<String, Object>> rows = feesForwardService.search(classId, section);
            Map<String, Object> body = new HashMap<>();
            body.put("students", rows);
            LocalDate dueDate = null;
            for (Map<String, Object> row : rows) {
                if (row.get("dueDate") != null) {
                    dueDate = (LocalDate) row.get("dueDate");
                    break;
                }
            }
            body.put("dueDate", dueDate);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load fees carry forward"));
        }
    }

    @PostMapping("/api/fees-forward/save")
    @ResponseBody
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> save(@RequestBody Map<String, Object> payload) {
        try {
            Long classId = asLong(payload.get("classId"));
            String section = asString(payload.get("section"));
            LocalDate dueDate = asDate(payload.get("dueDate"));
            List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
            return ResponseEntity.ok(feesForwardService.saveBalances(classId, section, dueDate, items));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save fees carry forward"));
        }
    }

    @DeleteMapping("/api/fees-forward")
    @ResponseBody
    public ResponseEntity<?> delete(
            @RequestParam Long classId,
            @RequestParam String section
    ) {
        try {
            feesForwardService.deleteCarryForward(classId, section);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete fees carry forward"));
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid class");
        }
    }

    private LocalDate asDate(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(String.valueOf(value).trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid due date");
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
