package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.FeeDiscount;
import com.kantechsolution.smart_school.service.FeeDiscountService;
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
 * Fees Discount page and API.
 */
@Controller
public class FeeDiscountController {

    @Autowired
    private FeeDiscountService feeDiscountService;

    @GetMapping("/feediscount")
    public String showFeeDiscountPage(Model model) {
        return "feediscount";
    }

    @GetMapping("/api/fee-discounts")
    @ResponseBody
    public ResponseEntity<List<FeeDiscount>> getAllDiscounts() {
        try {
            return ResponseEntity.ok(feeDiscountService.getAllDiscounts());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/api/fee-discounts")
    @ResponseBody
    public ResponseEntity<?> createDiscount(@RequestBody Map<String, Object> payload) {
        try {
            FeeDiscount saved = feeDiscountService.createDiscount(
                    asString(payload.get("name")),
                    asString(payload.get("discountCode")),
                    asString(payload.get("discountType")),
                    asDouble(payload.get("percentage")),
                    asDouble(payload.get("amount")),
                    asInteger(payload.get("numberOfUseCount")),
                    asDate(payload.get("expiryDate")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create fees discount"));
        }
    }

    @PutMapping("/api/fee-discounts/{id}")
    @ResponseBody
    public ResponseEntity<?> updateDiscount(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            FeeDiscount updated = feeDiscountService.updateDiscount(
                    id,
                    asString(payload.get("name")),
                    asString(payload.get("discountCode")),
                    asString(payload.get("discountType")),
                    asDouble(payload.get("percentage")),
                    asDouble(payload.get("amount")),
                    asInteger(payload.get("numberOfUseCount")),
                    asDate(payload.get("expiryDate")),
                    asString(payload.get("description"))
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Fees discount not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to update fees discount"));
        }
    }

    @DeleteMapping("/api/fee-discounts/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteDiscount(@PathVariable Long id) {
        try {
            feeDiscountService.deleteDiscount(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to delete fees discount"));
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
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

    private Integer asInteger(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number of use count");
        }
    }

    private LocalDate asDate(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(String.valueOf(value).trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid expiry date");
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
