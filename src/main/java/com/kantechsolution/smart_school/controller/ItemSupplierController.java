package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.InventoryItemSupplierService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ItemSupplierController {

    private final InventoryItemSupplierService supplierService;

    public ItemSupplierController(InventoryItemSupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping("/dailyassignment/admin/itemsupplier")
    public String showItemSupplierPage() {
        return "item-supplier";
    }

    @GetMapping("/api/inventory/item-suppliers")
    @ResponseBody
    public ResponseEntity<?> listSuppliers() {
        try {
            return ResponseEntity.ok(supplierService.listSuppliers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load item suppliers"));
        }
    }

    @PostMapping("/api/inventory/item-suppliers")
    @ResponseBody
    public ResponseEntity<?> createSupplier(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = supplierService.createSupplier(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item supplier saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save item supplier"));
        }
    }

    @PutMapping("/api/inventory/item-suppliers/{id}")
    @ResponseBody
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> saved = supplierService.updateSupplier(id, payload);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item supplier updated successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update item supplier"));
        }
    }

    @DeleteMapping("/api/inventory/item-suppliers/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteSupplier(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item supplier deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete item supplier"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
