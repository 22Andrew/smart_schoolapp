package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/admin/chat")
    public String chatPage() {
        return "chat-system";
    }

    @GetMapping("/api/chat/contacts")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listContacts() {
        return ResponseEntity.ok(chatService.listContacts());
    }

    @GetMapping("/api/chat/messages")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listMessages(@RequestParam String contactType,
                                                                   @RequestParam Long contactSourceId) {
        return ResponseEntity.ok(chatService.listMessages(contactType, contactSourceId));
    }

    @GetMapping("/api/chat/search")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(chatService.searchUsers(query));
    }

    @DeleteMapping("/api/chat/messages/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            chatService.deleteMessage(id);
            response.put("success", true);
            response.put("message", "Message deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/api/chat/messages")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = chatService.sendMessage(payload);
            response.put("success", true);
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
