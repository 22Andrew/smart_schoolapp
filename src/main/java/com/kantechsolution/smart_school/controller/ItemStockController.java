package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.InventoryItemStockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ItemStockController {

    private final InventoryItemStockService stockService;

    public ItemStockController(InventoryItemStockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/dailyassignment/admin/itemstock")
    public String showItemStockPage() {
        return "item-stock";
    }

    @GetMapping("/api/inventory/item-stock")
    @ResponseBody
    public ResponseEntity<?> listStock() {
        try {
            return ResponseEntity.ok(stockService.listStock());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load item stock"));
        }
    }

    @GetMapping("/api/inventory/item-stock/{id}")
    @ResponseBody
    public ResponseEntity<?> getStock(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(stockService.getStock(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load item stock"));
        }
    }

    @GetMapping("/api/inventory/item-stock-options")
    @ResponseBody
    public ResponseEntity<?> formOptions() {
        try {
            return ResponseEntity.ok(stockService.formOptions());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load form options"));
        }
    }

    @PostMapping(value = "/api/inventory/item-stock", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> createStock(
            @RequestParam Map<String, String> payload,
            @RequestParam(value = "document", required = false) MultipartFile document
    ) {
        try {
            Map<String, Object> saved = stockService.createStock(payload, document);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item stock saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save item stock"));
        }
    }

    @PutMapping(value = "/api/inventory/item-stock/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestParam Map<String, String> payload,
            @RequestParam(value = "document", required = false) MultipartFile document
    ) {
        try {
            Map<String, Object> saved = stockService.updateStock(id, payload, document);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item stock updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update item stock"));
        }
    }

    @DeleteMapping("/api/inventory/item-stock/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteStock(@PathVariable Long id) {
        try {
            stockService.deleteStock(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item stock deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete item stock"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
