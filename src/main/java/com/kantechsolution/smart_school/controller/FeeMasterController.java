package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.FeeMaster;
import com.kantechsolution.smart_school.service.FeeGroupAssignmentService;
import com.kantechsolution.smart_school.service.FeeMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Fees Master page and API.
 */
@Controller
public class FeeMasterController {

    @Autowired
    private FeeMasterService feeMasterService;

    @Autowired
    private FeeGroupAssignmentService feeGroupAssignmentService;

    @GetMapping("/feemaster")
    public String showFeeMasterPage(Model model) {
        model.addAttribute("sessionYear", FeeMasterService.DEFAULT_SESSION);
        return "feemaster";
    }

    @GetMapping("/feemaster/assign/{feeGroupId}")
    public String showAssignFeesGroupPage(@PathVariable Long feeGroupId, Model model) {
        try {
            Map<String, Object> detail = feeMasterService.getGroupDetail(feeGroupId, FeeMasterService.DEFAULT_SESSION);
            model.addAttribute("sessionYear", FeeMasterService.DEFAULT_SESSION);
            model.addAttribute("feeGroupId", feeGroupId);
            model.addAttribute("feeGroupName", detail.get("feeGroupName"));
            return "feemaster-assign";
        } catch (IllegalArgumentException e) {
            return "redirect:/feemaster";
        }
    }

    @GetMapping("/api/fee-masters")
    @ResponseBody
    public ResponseEntity<?> getMasters(@RequestParam(required = false) String sessionYear) {
        try {
            return ResponseEntity.ok(feeMasterService.getGroupedMasters(sessionYear));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load fees masters"));
        }
    }

    @GetMapping("/api/fee-masters/group/{feeGroupId}")
    @ResponseBody
    public ResponseEntity<?> getGroupDetail(
            @PathVariable Long feeGroupId,
            @RequestParam(required = false) String sessionYear
    ) {
        try {
            return ResponseEntity.ok(feeMasterService.getGroupDetail(feeGroupId, sessionYear));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load fees group detail"));
        }
    }

    @GetMapping("/api/fee-group-assignments/{feeGroupId}")
    @ResponseBody
    public ResponseEntity<?> getAssignments(
            @PathVariable Long feeGroupId,
            @RequestParam(required = false) String sessionYear
    ) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("studentIds", feeGroupAssignmentService.getAssignedStudentIds(feeGroupId, sessionYear));
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load fee group assignments"));
        }
    }

    @PostMapping("/api/fee-group-assignments/{feeGroupId}")
    @ResponseBody
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> saveAssignments(
            @PathVariable Long feeGroupId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            String sessionYear = asString(payload.get("sessionYear"));
            List<Long> studentIds = new ArrayList<>();
            Object raw = payload.get("studentIds");
            if (raw instanceof List<?> list) {
                for (Object value : list) {
                    if (value != null && !String.valueOf(value).isBlank()) {
                        studentIds.add(Long.valueOf(String.valueOf(value).trim()));
                    }
                }
            }
            feeGroupAssignmentService.saveAssignments(feeGroupId, sessionYear, studentIds);
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Assignments saved");
            body.put("count", studentIds.size());
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save fee group assignments"));
        }
    }

    @PostMapping("/api/fee-masters")
    @ResponseBody
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            FeeMaster saved = feeMasterService.create(
                    asLong(payload.get("feeGroupId")),
                    asLong(payload.get("feeTypeId")),
                    asString(payload.get("sessionYear")),
                    asDate(payload.get("dueDate")),
                    asDouble(payload.get("amount")),
                    asString(payload.get("fineType")),
                    asDouble(payload.get("percentage")),
                    asDouble(payload.get("fixAmount"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create fees master"));
        }
    }

    @PutMapping("/api/fee-masters/{id}")
    @ResponseBody
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            FeeMaster updated = feeMasterService.update(
                    id,
                    asLong(payload.get("feeGroupId")),
                    asLong(payload.get("feeTypeId")),
                    asString(payload.get("sessionYear")),
                    asDate(payload.get("dueDate")),
                    asDouble(payload.get("amount")),
                    asString(payload.get("fineType")),
                    asDouble(payload.get("percentage")),
                    asDouble(payload.get("fixAmount"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Fees master not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update fees master"));
        }
    }

    @DeleteMapping("/api/fee-masters/{id}")
    @ResponseBody
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            feeMasterService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete fees master"));
        }
    }

    @DeleteMapping("/api/fee-masters/group/{feeGroupId}")
    @ResponseBody
    public ResponseEntity<?> deleteGroup(
            @PathVariable Long feeGroupId,
            @RequestParam(required = false) String sessionYear
    ) {
        try {
            feeMasterService.deleteGroup(feeGroupId, sessionYear);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete fees master group"));
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            throw new IllegalArgumentException("Required selection is missing");
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid selection value");
        }
    }

    private Double asDouble(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number value");
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
