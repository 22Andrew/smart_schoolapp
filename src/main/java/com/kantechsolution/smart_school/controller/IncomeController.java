package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Income;
import com.kantechsolution.smart_school.model.IncomeHead;
import com.kantechsolution.smart_school.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping("/income/incomehead")
    public String showIncomeHeadPage() {
        return "income-incomehead";
    }

    @GetMapping("/income/incomesearch")
    public String showIncomeSearchPage() {
        return "income-incomesearch";
    }

    @GetMapping("/income")
    public String showIncomePage() {
        return "income";
    }

    @GetMapping("/api/income-heads")
    @ResponseBody
    public ResponseEntity<List<IncomeHead>> getIncomeHeads() {
        return ResponseEntity.ok(incomeService.getAllIncomeHeads());
    }

    @PostMapping("/api/income-heads")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createIncomeHead(@RequestBody IncomeHead incomeHead) {
        Map<String, Object> response = new HashMap<>();
        try {
            IncomeHead saved = incomeService.saveIncomeHead(incomeHead);
            response.put("success", true);
            response.put("message", "Income head saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save income head: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/income-heads/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateIncomeHead(@PathVariable Long id, @RequestBody IncomeHead incomeHead) {
        Map<String, Object> response = new HashMap<>();
        try {
            IncomeHead updated = incomeService.updateIncomeHead(id, incomeHead);
            response.put("success", true);
            response.put("message", "Income head updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update income head: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/income-heads/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteIncomeHead(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            incomeService.deleteIncomeHead(id);
            response.put("success", true);
            response.put("message", "Income head deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete income head: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/incomes")
    @ResponseBody
    public ResponseEntity<List<Income>> getAllIncomes() {
        return ResponseEntity.ok(incomeService.getAllIncomes());
    }

    @GetMapping("/api/incomes/search")
    @ResponseBody
    public ResponseEntity<List<Income>> searchIncomes(
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(incomeService.searchIncomes(searchType, keyword));
    }

    @GetMapping("/api/incomes/{id}")
    @ResponseBody
    public ResponseEntity<Income> getIncomeById(@PathVariable Long id) {
        return incomeService.getIncomeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/incomes")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createIncome(@RequestBody Income income) {
        Map<String, Object> response = new HashMap<>();
        try {
            Income saved = incomeService.saveIncome(income);
            response.put("success", true);
            response.put("message", "Income record saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save income record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/incomes/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateIncome(@PathVariable Long id, @RequestBody Income income) {
        Map<String, Object> response = new HashMap<>();
        try {
            Income updated = incomeService.updateIncome(id, income);
            response.put("success", true);
            response.put("message", "Income record updated successfully!");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update income record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/incomes/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteIncome(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            incomeService.deleteIncome(id);
            response.put("success", true);
            response.put("message", "Income record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete income record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
