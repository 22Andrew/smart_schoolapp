package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StudentAttendanceService;
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
public class StudentAttendanceController {

    private final StudentAttendanceService studentAttendanceService;

    @GetMapping("/stuattendance/index")
    public String showStudentAttendancePage() {
        return "stuattendance-index";
    }

    @GetMapping("/stuattendence/attendencereport")
    public String showAttendanceByDateReport() {
        return "stuattendence-attendencereport";
    }

    @GetMapping("/api/student-attendance/statuses")
    @ResponseBody
    public ResponseEntity<List<String>> getStatuses() {
        return ResponseEntity.ok(studentAttendanceService.getStatuses());
    }

    @GetMapping("/api/student-attendance/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStudents(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam String attendanceDate) {
        return ResponseEntity.ok(studentAttendanceService.searchStudents(classId, section, attendanceDate));
    }

    @PostMapping("/api/student-attendance/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAttendance(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String attendanceDate = body.get("attendanceDate") != null ? String.valueOf(body.get("attendanceDate")) : "";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
            studentAttendanceService.saveAttendance(attendanceDate, records);
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
