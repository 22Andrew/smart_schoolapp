package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.FeeMasterService;
import com.kantechsolution.smart_school.service.StudentFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Student Fees (Add Fee) page and API.
 */
@Controller
public class StudentFeeController {

    @Autowired
    private StudentFeeService studentFeeService;

    @GetMapping("/studentfee")
    public String showCollectFeesPage() {
        return "studentfee";
    }

    @GetMapping("/studentfee/addfee/{studentId}")
    public String showAddFeePage(@PathVariable Long studentId, Model model) {
        try {
            Map<String, Object> data = studentFeeService.getStudentFeePage(studentId, FeeMasterService.DEFAULT_SESSION);
            model.addAttribute("studentId", studentId);
            model.addAttribute("sessionYear", data.get("sessionYear"));
            return "studentfee-addfee";
        } catch (IllegalArgumentException e) {
            return "redirect:/studentfee";
        }
    }

    @GetMapping("/studentfee/searchpayment")
    public String showSearchPaymentPage() {
        return "studentfee-searchpayment";
    }

    @GetMapping("/studentfee/quickfees")
    public String showQuickFeesPage() {
        return "studentfee-quickfees";
    }

    @GetMapping("/api/fee-payments/search")
    @ResponseBody
    public ResponseEntity<?> searchPayments(@RequestParam String paymentId) {
        try {
            return ResponseEntity.ok(studentFeeService.searchPayments(paymentId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to search fee payments"));
        }
    }

    @GetMapping("/api/student-fees/{studentId}")
    @ResponseBody
    public ResponseEntity<?> getStudentFees(
            @PathVariable Long studentId,
            @RequestParam(required = false) String sessionYear
    ) {
        try {
            return ResponseEntity.ok(studentFeeService.getStudentFeePage(studentId, sessionYear));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load student fees"));
        }
    }

    @PostMapping("/api/student-fees/{studentId}/collect")
    @ResponseBody
    public ResponseEntity<?> collectSelected(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            List<Long> feeMasterIds = new ArrayList<>();
            Object raw = payload.get("feeMasterIds");
            if (raw instanceof List<?> list) {
                for (Object value : list) {
                    if (value != null && !String.valueOf(value).isBlank()) {
                        feeMasterIds.add(Long.valueOf(String.valueOf(value).trim()));
                    }
                }
            }
            String sessionYear = asString(payload.get("sessionYear"));
            String mode = asString(payload.get("paymentMode"));
            String note = asString(payload.get("note"));
            return ResponseEntity.ok(studentFeeService.collectSelected(
                    studentId,
                    sessionYear,
                    feeMasterIds,
                    mode,
                    asDate(payload.get("paymentDate")),
                    note,
                    asDouble(payload.get("payingAmount"))
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to collect fees"));
        }
    }

    @PostMapping("/api/student-fees/{studentId}/collect-one")
    @ResponseBody
    public ResponseEntity<?> collectOne(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            Long feeMasterId = asLong(payload.get("feeMasterId"));
            String sessionYear = asString(payload.get("sessionYear"));
            String mode = asString(payload.get("paymentMode"));
            String note = asString(payload.get("note"));
            return ResponseEntity.ok(studentFeeService.collectSingle(
                    studentId,
                    sessionYear,
                    feeMasterId,
                    asDouble(payload.get("payingAmount")),
                    asDouble(payload.get("discountAmount")),
                    asDouble(payload.get("fineAmount")),
                    mode,
                    asDate(payload.get("paymentDate")),
                    note
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to collect fee"));
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            throw new IllegalArgumentException("Fee is required");
        }
        return Long.valueOf(String.valueOf(value).trim());
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

    private java.time.LocalDate asDate(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        String text = String.valueOf(value).trim();
        try {
            if (text.contains("/")) {
                String[] parts = text.split("/");
                if (parts.length == 3) {
                    return java.time.LocalDate.of(
                            Integer.parseInt(parts[2]),
                            Integer.parseInt(parts[0]),
                            Integer.parseInt(parts[1])
                    );
                }
            }
            return java.time.LocalDate.parse(text);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid payment date");
        }
    }

    @DeleteMapping("/api/student-fees/{studentId}/payments/{paymentId}")
    @ResponseBody
    public ResponseEntity<?> reversePayment(@PathVariable Long studentId, @PathVariable Long paymentId) {
        try {
            studentFeeService.reversePayment(studentId, paymentId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to reverse payment"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
