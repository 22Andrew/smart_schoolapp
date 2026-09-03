package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppCustomFieldService;
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
public class AppCustomFieldController {

    private final AppCustomFieldService appCustomFieldService;

    @GetMapping({"/admin/customfield", "/admin/customfield/", "/admin/customfield/index"})
    public String page() {
        return "customfield";
    }

    @GetMapping("/api/custom-fields")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> list() {
        return ResponseEntity.ok(appCustomFieldService.getPageData());
    }

    @PostMapping("/api/custom-fields")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appCustomFieldService.create(payload);
            response.put("success", true);
            response.put("message", "Custom field saved successfully!");
            response.put("data", saved);
            response.put("groupedFields", appCustomFieldService.listGrouped());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/api/custom-fields/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id,
                                                        @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appCustomFieldService.update(id, payload);
            response.put("success", true);
            response.put("message", "Custom field updated successfully!");
            response.put("data", saved);
            response.put("groupedFields", appCustomFieldService.listGrouped());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/api/custom-fields/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            appCustomFieldService.delete(id);
            response.put("success", true);
            response.put("message", "Custom field deleted successfully!");
            response.put("groupedFields", appCustomFieldService.listGrouped());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/api/custom-fields/reorder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> reorder(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String belongTo = payload.get("belongTo") == null ? "" : payload.get("belongTo").toString();
            List<Long> ids = parseIdList(payload.get("ids"));
            appCustomFieldService.reorder(belongTo, ids);
            response.put("success", true);
            response.put("message", "Record updated successfully");
            response.put("groupedFields", appCustomFieldService.listGrouped());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private List<Long> parseIdList(Object rawIds) {
        if (!(rawIds instanceof List<?> list) || list.isEmpty()) {
            throw new IllegalArgumentException("Invalid reorder request");
        }
        return list.stream()
                .map(item -> Long.valueOf(item.toString()))
                .toList();
    }
}
