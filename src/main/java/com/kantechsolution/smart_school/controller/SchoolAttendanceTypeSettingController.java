package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.SchoolAttendanceTypeSettingService;
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
public class SchoolAttendanceTypeSettingController {

    private final SchoolAttendanceTypeSettingService attendanceTypeSettingService;

    @GetMapping("/schsettings/attendancetype")
    public String showAttendanceTypeSettingsPage() {
        return "schsettings-attendancetype";
    }

    @GetMapping("/api/schsettings/attendance-type")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getAttendanceTypeSettings() {
        return ResponseEntity.ok(attendanceTypeSettingService.getAllSettings());
    }

    @PutMapping("/api/schsettings/attendance-type/general")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveGeneralSettings(@RequestBody Map<String, Object> payload) {
        return saveResponse("Attendance type settings saved successfully!", () ->
                attendanceTypeSettingService.saveGeneralSettings(payload));
    }

    @PutMapping("/api/schsettings/attendance-type/class-times")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveClassTimes(@RequestBody Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("classTimes");
        return saveResponse("Class attendance times saved successfully!", () ->
                attendanceTypeSettingService.saveClassTimes(items));
    }

    @PutMapping("/api/schsettings/attendance-type/rules")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveRules(@RequestBody Map<String, Object> payload) {
        String audience = payload.get("audience") == null ? "" : payload.get("audience").toString();
        String roleName = payload.get("roleName") == null ? "" : payload.get("roleName").toString();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rules = (List<Map<String, Object>>) payload.get("rules");
        return saveResponse("Attendance rules saved successfully!", () ->
                attendanceTypeSettingService.saveRules(audience, roleName, rules));
    }

    @PutMapping("/api/schsettings/attendance-type/student-rules")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveStudentRules(@RequestBody Map<String, Object> payload) {
        Long classId = parseClassId(payload.get("classId"));
        @SuppressWarnings("unchecked")
        Map<String, List<Map<String, Object>>> sections =
                (Map<String, List<Map<String, Object>>>) payload.get("sections");
        return saveResponse("Student attendance rules saved successfully!", () ->
                attendanceTypeSettingService.saveStudentClassRules(classId, sections));
    }

    private Long parseClassId(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value.toString().trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Class is required");
        }
    }

    private ResponseEntity<Map<String, Object>> saveResponse(String message, SaveAction action) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object saved = action.run();
            response.put("success", true);
            response.put("message", message);
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save attendance settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Object run();
    }
}
