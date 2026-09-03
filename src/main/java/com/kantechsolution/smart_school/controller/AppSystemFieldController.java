package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppSystemFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppSystemFieldController {

    private final AppSystemFieldService appSystemFieldService;

    @GetMapping({"/admin/systemfield", "/admin/systemfield/", "/admin/systemfield/index"})
    public String page() {
        return "systemfield";
    }

    @GetMapping("/api/system-fields")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list(@RequestParam(defaultValue = "student") String type) {
        return ResponseEntity.ok(appSystemFieldService.listByType(type));
    }

    @PutMapping("/api/system-fields/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateStatus(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String type = payload.get("type") == null ? "student" : payload.get("type").toString();
            String role = payload.get("role") == null ? "" : payload.get("role").toString();
            boolean enabled = resolveEnabled(payload);
            Map<String, Object> saved = appSystemFieldService.setEnabled(type, role, enabled);
            response.put("success", true);
            response.put("message", "Status change successfully");
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

    private boolean resolveEnabled(Map<String, Object> payload) {
        if (Boolean.TRUE.equals(payload.get("enabled"))) {
            return true;
        }
        if (Boolean.FALSE.equals(payload.get("enabled"))) {
            return false;
        }
        String status = payload.get("status") == null ? "" : payload.get("status").toString();
        return "yes".equalsIgnoreCase(status) || "1".equals(status) || "true".equalsIgnoreCase(status);
    }
}
