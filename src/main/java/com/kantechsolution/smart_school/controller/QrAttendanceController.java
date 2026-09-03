package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.QrAttendanceSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class QrAttendanceController {

    private final QrAttendanceSettingService qrAttendanceSettingService;

    @GetMapping("/qrattendance/qrsetting/index")
    public String showQrSettingPage() {
        return "qrattendance-qrsetting-index";
    }

    @GetMapping("/qrattendance/attendance/index")
    public String showQrAttendancePage() {
        return "qrattendance-attendance-index";
    }

    @GetMapping("/api/qrattendance/settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getQrAttendanceSettings() {
        return ResponseEntity.ok(qrAttendanceSettingService.getSettings());
    }

    @PutMapping("/api/qrattendance/settings")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveQrAttendanceSettings(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = qrAttendanceSettingService.saveSettings(body);
            response.put("success", true);
            response.put("message", "QR attendance settings saved successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save QR attendance settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
