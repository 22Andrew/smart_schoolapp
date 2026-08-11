package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.MarksDivisionService;
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
public class MarksDivisionController {

    private final MarksDivisionService marksDivisionService;

    @GetMapping("/marksdivision")
    public String showMarksDivisionPage() {
        return "marksdivision";
    }

    @GetMapping("/api/marks-divisions")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getDivisions() {
        return ResponseEntity.ok(marksDivisionService.getAllDivisions());
    }

    @GetMapping("/api/marks-divisions/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDivision(@PathVariable Long id) {
        return ResponseEntity.ok(marksDivisionService.getDivisionById(id));
    }

    @PostMapping("/api/marks-divisions")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createDivision(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> marksDivisionService.createDivision(body),
                "Marks division saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/marks-divisions/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDivision(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> body) {
        return saveResponse(() -> marksDivisionService.updateDivision(id, body),
                "Marks division updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/marks-divisions/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteDivision(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            marksDivisionService.deleteDivision(id);
            response.put("success", true);
            response.put("message", "Marks division deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete marks division: " + e.getMessage());
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
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save marks division: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
