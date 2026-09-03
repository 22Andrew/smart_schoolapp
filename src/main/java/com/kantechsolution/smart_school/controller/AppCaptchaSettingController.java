package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppCaptchaSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppCaptchaSettingController {

    private final AppCaptchaSettingService appCaptchaSettingService;

    @GetMapping({"/admin/captcha", "/admin/captcha/", "/admin/captcha/index"})
    public String page() {
        return "captcha";
    }

    @GetMapping("/api/captcha-settings")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(appCaptchaSettingService.listAll());
    }

    @PutMapping("/api/captcha-settings/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateStatus(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String slug = payload.get("name") == null ? "" : payload.get("name").toString();
            boolean enabled = Boolean.TRUE.equals(payload.get("enabled"))
                    || Boolean.TRUE.equals(payload.get("status"))
                    || "1".equals(String.valueOf(payload.get("status")));
            Map<String, Object> saved = appCaptchaSettingService.setEnabled(slug, enabled);
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
}
