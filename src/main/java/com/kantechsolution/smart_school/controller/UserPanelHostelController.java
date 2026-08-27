package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelHostelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/hostelroom")
@RequiredArgsConstructor
public class UserPanelHostelController {

    private final UserPanelHostelService userPanelHostelService;

    @GetMapping
    public ResponseEntity<?> listHostelRooms(Authentication authentication) {
        try {
            return ResponseEntity.ok(userPanelHostelService.listHostelRooms(authentication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load hostel rooms"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("success", "false");
        body.put("message", message);
        return body;
    }
}
