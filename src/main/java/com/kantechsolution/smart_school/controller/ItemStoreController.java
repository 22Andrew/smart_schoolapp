package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.InventoryItemStoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ItemStoreController {

    private final InventoryItemStoreService storeService;

    public ItemStoreController(InventoryItemStoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping("/dailyassignment/admin/itemstore")
    public String showItemStorePage() {
        return "item-store";
    }

    @GetMapping("/api/inventory/item-stores")
    @ResponseBody
    public ResponseEntity<?> listStores() {
        try {
            return ResponseEntity.ok(storeService.listStores());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load item stores"));
        }
    }

    @PostMapping("/api/inventory/item-stores")
    @ResponseBody
    public ResponseEntity<?> createStore(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = storeService.createStore(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item store saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save item store"));
        }
    }

    @PutMapping("/api/inventory/item-stores/{id}")
    @ResponseBody
    public ResponseEntity<?> updateStore(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = storeService.updateStore(id, payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item store updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update item store"));
        }
    }

    @DeleteMapping("/api/inventory/item-stores/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteStore(@PathVariable Long id) {
        try {
            storeService.deleteStore(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item store deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete item store"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
