package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.Expense;
import com.kantechsolution.smart_school.model.ExpenseHead;
import com.kantechsolution.smart_school.service.ExpenseService;
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
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/expense/expensehead")
    public String showExpenseHeadPage() {
        return "expense-expensehead";
    }

    @GetMapping("/expense/searchexpense")
    public String showExpenseSearchPage() {
        return "expense-searchexpense";
    }

    @GetMapping("/expense")
    public String showExpensePage() {
        return "expense";
    }

    @GetMapping("/api/expense-heads")
    @ResponseBody
    public ResponseEntity<List<ExpenseHead>> getExpenseHeads() {
        return ResponseEntity.ok(expenseService.getAllExpenseHeads());
    }

    @PostMapping("/api/expense-heads")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createExpenseHead(@RequestBody ExpenseHead expenseHead) {
        Map<String, Object> response = new HashMap<>();
        try {
            ExpenseHead saved = expenseService.saveExpenseHead(expenseHead);
            response.put("success", true);
            response.put("message", "Expense head saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save expense head: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/expense-heads/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateExpenseHead(@PathVariable Long id, @RequestBody ExpenseHead expenseHead) {
        Map<String, Object> response = new HashMap<>();
        try {
            ExpenseHead updated = expenseService.updateExpenseHead(id, expenseHead);
            response.put("success", true);
            response.put("message", "Expense head updated successfully!");
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
            response.put("message", "Failed to update expense head: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/expense-heads/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteExpenseHead(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            expenseService.deleteExpenseHead(id);
            response.put("success", true);
            response.put("message", "Expense head deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete expense head: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/expenses")
    @ResponseBody
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/api/expenses/search")
    @ResponseBody
    public ResponseEntity<List<Expense>> searchExpenses(
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(expenseService.searchExpenses(searchType, keyword));
    }

    @GetMapping("/api/expenses/{id}")
    @ResponseBody
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/expenses")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createExpense(@RequestBody Expense expense) {
        Map<String, Object> response = new HashMap<>();
        try {
            Expense saved = expenseService.saveExpense(expense);
            response.put("success", true);
            response.put("message", "Expense record saved successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save expense record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/expenses/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        Map<String, Object> response = new HashMap<>();
        try {
            Expense updated = expenseService.updateExpense(id, expense);
            response.put("success", true);
            response.put("message", "Expense record updated successfully!");
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
            response.put("message", "Failed to update expense record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/expenses/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteExpense(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            expenseService.deleteExpense(id);
            response.put("success", true);
            response.put("message", "Expense record deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete expense record: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
