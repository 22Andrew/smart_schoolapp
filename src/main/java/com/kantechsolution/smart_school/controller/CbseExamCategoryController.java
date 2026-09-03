package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseExamCategoryService;
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
public class CbseExamCategoryController {

    private final CbseExamCategoryService cbseExamCategoryService;

    @GetMapping("/cbseexam/cbsecategory/index")
    public String showCbseExamCategoryPage() {
        return "cbseexam-cbsecategory-index";
    }

    @GetMapping("/api/cbse-exam-categories")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamCategories() {
        return ResponseEntity.ok(cbseExamCategoryService.getAllCategories());
    }

    @PostMapping("/api/cbse-exam-categories")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createCbseExamCategory(@RequestBody Map<String, String> body) {
        return saveResponse(() -> cbseExamCategoryService.createCategory(body.get("categoryName")),
                "Category saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-exam-categories/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCbseExamCategory(@PathVariable Long id,
                                                                      @RequestBody Map<String, String> body) {
        return saveResponse(() -> cbseExamCategoryService.updateCategory(id, body.get("categoryName")),
                "Category updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-exam-categories/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCbseExamCategory(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseExamCategoryService.deleteCategory(id);
            response.put("success", true);
            response.put("message", "Category deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> saveResponse(SaveAction action, String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.run();
            response.put("success", true);
            response.put("message", message);
            response.put("data", data);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
