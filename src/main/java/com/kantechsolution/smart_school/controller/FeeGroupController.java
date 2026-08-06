package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.FeeGroup;
import com.kantechsolution.smart_school.service.FeeGroupService;
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
 * Fees Group page and API.
 */
@Controller
public class FeeGroupController {

    @Autowired
    private FeeGroupService feeGroupService;

    @GetMapping({"/feegroup/index", "/feegroup"})
    public String showFeeGroupPage(Model model) {
        return "feegroup";
    }

    @GetMapping("/api/fee-groups")
    @ResponseBody
    public ResponseEntity<List<FeeGroup>> getAllGroups() {
        try {
            return ResponseEntity.ok(feeGroupService.getAllGroups());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/fee-groups")
    @ResponseBody
    public ResponseEntity<?> createGroup(@RequestBody Map<String, String> payload) {
        try {
            FeeGroup saved = feeGroupService.createGroup(
                    payload.get("name"),
                    payload.get("description")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create fees group"));
        }
    }

    @PutMapping("/api/fee-groups/{id}")
    @ResponseBody
    public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            FeeGroup updated = feeGroupService.updateGroup(
                    id,
                    payload.get("name"),
                    payload.get("description")
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            String message = e.getMessage();
            if ("Fees group not found".equals(message)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update fees group"));
        }
    }

    @DeleteMapping("/api/fee-groups/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        try {
            feeGroupService.deleteGroup(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete fees group"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
