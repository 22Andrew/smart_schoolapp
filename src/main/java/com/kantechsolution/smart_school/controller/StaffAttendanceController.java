package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StaffAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class StaffAttendanceController {

    private final StaffAttendanceService staffAttendanceService;

    @GetMapping("/staffattendance/index")
    public String showStaffAttendancePage() {
        return "staffattendance-index";
    }

    @GetMapping("/api/staff-attendance/statuses")
    @ResponseBody
    public ResponseEntity<List<String>> getStatuses() {
        return ResponseEntity.ok(staffAttendanceService.getStatuses());
    }

    @GetMapping("/api/staff-attendance/roles")
    @ResponseBody
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(staffAttendanceService.getRoles());
    }

    @GetMapping("/api/staff-attendance/sources")
    @ResponseBody
    public ResponseEntity<List<String>> getSources() {
        return ResponseEntity.ok(staffAttendanceService.getSources());
    }

    @GetMapping("/api/staff-attendance/staff")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStaff(
            @RequestParam(required = false) String role,
            @RequestParam String attendanceDate) {
        return ResponseEntity.ok(staffAttendanceService.searchStaff(role, attendanceDate));
    }

    @PostMapping("/api/staff-attendance/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAttendance(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String attendanceDate = body.get("attendanceDate") != null ? String.valueOf(body.get("attendanceDate")) : "";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
            staffAttendanceService.saveAttendance(attendanceDate, records);
            response.put("success", true);
            response.put("message", "Attendance saved successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save attendance: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
