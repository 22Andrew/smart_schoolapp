package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolChatSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SchoolChatSettingController {

    private final SchoolChatSettingService chatSettingService;

    @GetMapping("/schsettings/chatsetting")
    public String showChatSettingsPage() {
        return "schsettings-chatsetting";
    }

    @GetMapping("/api/schsettings/chat")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getChatSettings() {
        return ResponseEntity.ok(chatSettingService.getSettings());
    }

    @PutMapping("/api/schsettings/chat")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveChatSettings(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = chatSettingService.saveSettings(payload);
            response.put("success", true);
            response.put("message", "Chat settings saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save Chat settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
