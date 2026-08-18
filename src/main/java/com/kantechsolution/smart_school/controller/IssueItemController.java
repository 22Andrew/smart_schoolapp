package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.InventoryIssueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class IssueItemController {

    private final InventoryIssueService inventoryIssueService;

    public IssueItemController(InventoryIssueService inventoryIssueService) {
        this.inventoryIssueService = inventoryIssueService;
    }

    @GetMapping("/dailyassignment/admin/issueitem")
    public String showIssueItemPage() {
        return "issue-item";
    }

    @GetMapping("/api/inventory/issue-items")
    @ResponseBody
    public ResponseEntity<?> listIssues() {
        try {
            return ResponseEntity.ok(inventoryIssueService.listIssues());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load issue items"));
        }
    }

    @GetMapping("/api/inventory/issue-options")
    @ResponseBody
    public ResponseEntity<?> formOptions() {
        try {
            return ResponseEntity.ok(inventoryIssueService.formOptions());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load form options"));
        }
    }

    @GetMapping("/api/inventory/items")
    @ResponseBody
    public ResponseEntity<?> listItems(@RequestParam(required = false) Long categoryId) {
        try {
            return ResponseEntity.ok(inventoryIssueService.listItems(categoryId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load items"));
        }
    }

    @PostMapping("/api/inventory/issue-items")
    @ResponseBody
    public ResponseEntity<?> createIssue(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = inventoryIssueService.createIssue(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item issued successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to issue item"));
        }
    }

    @PostMapping("/api/inventory/issue-items/{id}/return")
    @ResponseBody
    public ResponseEntity<?> returnIssue(@PathVariable Long id) {
        try {
            Map<String, Object> saved = inventoryIssueService.returnIssue(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item returned successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to return item"));
        }
    }

    @DeleteMapping("/api/inventory/issue-items/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        try {
            inventoryIssueService.deleteIssue(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Issue item deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete issue item"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
