package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ClassTimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API for Academics Class Timetable persistence.
 */
@Controller
public class ClassTimetableController {

    @Autowired
    private ClassTimetableService classTimetableService;

    @GetMapping("/api/timetable")
    @ResponseBody
    public ResponseEntity<?> getTimetable(@RequestParam Long classId, @RequestParam String section) {
        try {
            return ResponseEntity.ok(classTimetableService.getTimetable(classId, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load timetable"));
        }
    }

    @GetMapping("/api/timetable/teacher")
    @ResponseBody
    public ResponseEntity<?> getTeacherTimetable(@RequestParam String teacherCode) {
        try {
            return ResponseEntity.ok(classTimetableService.getTimetableByTeacher(teacherCode));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load teacher timetable"));
        }
    }

    @PostMapping("/api/timetable")
    @ResponseBody
    public ResponseEntity<?> saveTimetable(@RequestBody Map<String, Object> payload) {
        try {
            Long classId = asLong(payload.get("classId"));
            String section = payload.get("section") == null ? null : String.valueOf(payload.get("section"));
            Long subjectGroupId = asLong(payload.get("subjectGroupId"));

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> periods = (List<Map<String, Object>>) payload.get("periods");

            List<Map<String, Object>> saved = classTimetableService.saveTimetable(
                    classId, section, subjectGroupId, periods);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to save timetable"));
        }
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return body;
    }

    private Long asLong(Object value) {
        if (value == null || "".equals(String.valueOf(value).trim())) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
