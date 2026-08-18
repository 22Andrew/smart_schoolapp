package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.InventoryItemManageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ItemController {

    private final InventoryItemManageService itemManageService;

    public ItemController(InventoryItemManageService itemManageService) {
        this.itemManageService = itemManageService;
    }

    @GetMapping("/dailyassignment/admin/item")
    public String showAddItemPage() {
        return "add-item";
    }

    @GetMapping("/api/inventory/catalog-items")
    @ResponseBody
    public ResponseEntity<?> listItems() {
        try {
            return ResponseEntity.ok(itemManageService.listItems());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load items"));
        }
    }

    @GetMapping("/api/inventory/item-categories")
    @ResponseBody
    public ResponseEntity<?> listCategories() {
        try {
            return ResponseEntity.ok(itemManageService.listCategories());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load item categories"));
        }
    }

    @PostMapping("/api/inventory/catalog-items")
    @ResponseBody
    public ResponseEntity<?> createItem(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = itemManageService.createItem(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save item"));
        }
    }

    @PutMapping("/api/inventory/catalog-items/{id}")
    @ResponseBody
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = itemManageService.updateItem(id, payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update item"));
        }
    }

    @DeleteMapping("/api/inventory/catalog-items/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemManageService.deleteItem(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete item"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
