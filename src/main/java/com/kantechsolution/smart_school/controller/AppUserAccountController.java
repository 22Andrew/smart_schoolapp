package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppUserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppUserAccountController {

    private final AppUserAccountService appUserAccountService;

    @GetMapping({"/admin/users", "/admin/users/", "/admin/users/index"})
    public String page() {
        return "users";
    }

    @GetMapping("/api/users")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list(@RequestParam(defaultValue = "student") String type) {
        return ResponseEntity.ok(appUserAccountService.listByType(type));
    }

    @PutMapping("/api/users/{id}/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id,
                                                              @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean enabled = Boolean.TRUE.equals(payload.get("loginEnabled"));
            Map<String, Object> saved = appUserAccountService.setLoginEnabled(id, enabled);
            response.put("success", true);
            response.put("message", "User status updated successfully!");
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
