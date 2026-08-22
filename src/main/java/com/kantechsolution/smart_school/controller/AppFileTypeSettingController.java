package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AppFileTypeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AppFileTypeSettingController {

    private final AppFileTypeSettingService appFileTypeSettingService;

    @GetMapping({
            "/admin/filetype",
            "/admin/filetype/",
            "/admin/filetype/index",
            "/admin/admin/filetype",
            "/admin/admin/filetype/",
            "/admin/admin/filetype/index"
    })
    public String page() {
        return "filetype";
    }

    @GetMapping("/api/file-type-settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(appFileTypeSettingService.getSettings());
    }

    @PutMapping("/api/file-type-settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSettings(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = appFileTypeSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Record saved successfully");
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
