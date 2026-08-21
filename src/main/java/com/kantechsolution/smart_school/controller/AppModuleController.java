package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppModuleController {

    private final AppModuleService appModuleService;

    @GetMapping({"/admin/module", "/admin/module/", "/admin/module/index"})
    public String page() {
        return "module";
    }

    @GetMapping("/api/modules")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list(@RequestParam(defaultValue = "system") String type) {
        return ResponseEntity.ok(appModuleService.listByType(type));
    }

    @PutMapping("/api/modules/{id}/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean enabled = Boolean.TRUE.equals(payload.get("enabled"));
            Map<String, Object> saved = appModuleService.setEnabled(id, enabled);
            response.put("success", true);
            response.put("message", "Module status updated successfully!");
            response.put("data", saved);
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
}
