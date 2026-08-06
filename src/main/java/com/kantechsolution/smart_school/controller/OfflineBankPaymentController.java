package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.OfflineBankPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Offline Bank Payments page and API.
 */
@Controller
public class OfflineBankPaymentController {

    @Autowired
    private OfflineBankPaymentService offlineBankPaymentService;

    @GetMapping("/offlinepayment")
    public String showOfflinePaymentPage() {
        return "offlinepayment";
    }

    @GetMapping("/api/offline-payments")
    @ResponseBody
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(offlineBankPaymentService.getAllPayments());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load offline bank payments"));
        }
    }

    @PostMapping("/api/offline-payments")
    @ResponseBody
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    offlineBankPaymentService.createPayment(
                            asString(payload.get("admissionNo")),
                            asDate(payload.get("paymentDate")),
                            asDouble(payload.get("amount")),
                            asString(payload.get("note"))
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to create offline bank payment"));
        }
    }

    @PostMapping("/api/offline-payments/{id}/approve")
    @ResponseBody
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(offlineBankPaymentService.approvePayment(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to approve offline bank payment"));
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
            throw new IllegalArgumentException("Invalid amount");
        }
    }

    private LocalDate asDate(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        String text = String.valueOf(value).trim();
        try {
            if (text.contains("/")) {
                String[] parts = text.split("/");
                if (parts.length == 3) {
                    return LocalDate.of(
                            Integer.parseInt(parts[2]),
                            Integer.parseInt(parts[0]),
                            Integer.parseInt(parts[1])
                    );
                }
            }
            return LocalDate.parse(text);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid payment date");
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
