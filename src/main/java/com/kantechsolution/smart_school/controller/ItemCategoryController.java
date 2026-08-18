package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.InventoryItemCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ItemCategoryController {

    private final InventoryItemCategoryService categoryService;

    public ItemCategoryController(InventoryItemCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/dailyassignment/admin/itemcategory")
    public String showItemCategoryPage() {
        return "item-category";
    }

    @PostMapping("/api/inventory/item-categories")
    @ResponseBody
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = categoryService.createCategory(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item category saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save item category"));
        }
    }

    @PutMapping("/api/inventory/item-categories/{id}")
    @ResponseBody
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = categoryService.updateCategory(id, payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item category updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update item category"));
        }
    }

    @DeleteMapping("/api/inventory/item-categories/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item category deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete item category"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
