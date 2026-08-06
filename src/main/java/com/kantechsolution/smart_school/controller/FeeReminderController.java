package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.model.FeeReminder;
import com.kantechsolution.smart_school.service.FeeReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Fees Reminder settings page and API.
 */
@Controller
public class FeeReminderController {

    @Autowired
    private FeeReminderService feeReminderService;

    @GetMapping({"/feereminder/setting", "/feereminder/settings", "/feereminder"})
    public String showFeeReminderPage(Model model) {
        return "feereminder";
    }

    @GetMapping("/api/fee-reminders")
    @ResponseBody
    public ResponseEntity<?> getSettings() {
        try {
            return ResponseEntity.ok(feeReminderService.getSettings());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load fee reminders"));
        }
    }

    @PostMapping("/api/fee-reminders")
    @ResponseBody
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, Object> payload) {
        try {
            List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
            List<FeeReminder> saved = feeReminderService.saveSettings(items);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save fee reminders"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }
}
