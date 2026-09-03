package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.FeeType;
import com.kantechsolution.smart_school.service.FeeTypeService;
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
 * Fees Type page and API.
 */
@Controller
public class FeeTypeController {

    @Autowired
    private FeeTypeService feeTypeService;

    @GetMapping("/feetype")
    public String showFeeTypePage(Model model) {
        return "feetype";
    }

    @GetMapping("/api/fee-types")
    @ResponseBody
    public ResponseEntity<List<FeeType>> getAllTypes() {
        try {
            return ResponseEntity.ok(feeTypeService.getAllTypes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/fee-types")
    @ResponseBody
    public ResponseEntity<?> createType(@RequestBody Map<String, String> payload) {
        try {
            FeeType saved = feeTypeService.createType(
                    payload.get("name"),
                    payload.get("feesCode"),
                    payload.get("description")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create fees type"));
        }
    }

    @PutMapping("/api/fee-types/{id}")
    @ResponseBody
    public ResponseEntity<?> updateType(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            FeeType updated = feeTypeService.updateType(
                    id,
                    payload.get("name"),
                    payload.get("feesCode"),
                    payload.get("description")
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Fees type not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update fees type"));
        }
    }

    @DeleteMapping("/api/fee-types/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteType(@PathVariable Long id) {
        try {
            feeTypeService.deleteType(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete fees type"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
