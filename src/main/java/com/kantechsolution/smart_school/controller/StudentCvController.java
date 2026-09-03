package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.StudentCvService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class StudentCvController {

    private final StudentCvService studentCvService;

    public StudentCvController(StudentCvService studentCvService) {
        this.studentCvService = studentCvService;
    }

    @GetMapping("/admin/resume/index")
    public String buildCvPage() {
        return "student-cv-build";
    }

    @GetMapping("/admin/resume/download")
    public String downloadCvPage() {
        return "student-cv-download";
    }

    @GetMapping("/admin/resume/fill/{studentId}")
    public String fillResumePage() {
        return "student-cv-fill";
    }

    @GetMapping("/admin/resume/print/{studentId}")
    public String printCvPage() {
        return "student-cv-print";
    }

    @GetMapping("/api/resume/settings")
    @ResponseBody
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(studentCvService.getSettings());
    }

    @PostMapping("/api/resume/settings")
    @ResponseBody
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, Object> payload) {
        return ok(studentCvService.saveSettings(payload), "CV settings saved successfully!");
    }

    @GetMapping("/api/resume/students")
    @ResponseBody
    public ResponseEntity<?> searchStudents(
            @RequestParam Long classId,
            @RequestParam(required = false) String section
    ) {
        return ResponseEntity.ok(studentCvService.searchStudents(classId, section));
    }

    @GetMapping("/api/resume/student/{studentId}")
    @ResponseBody
    public ResponseEntity<?> getResume(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentCvService.getResume(studentId));
    }

    @PostMapping("/api/resume/student/{studentId}/work")
    @ResponseBody
    public ResponseEntity<?> saveWork(@PathVariable Long studentId, @RequestBody Map<String, Object> payload) {
        return ok(studentCvService.saveWork(studentId, payload), "Work experience saved successfully!");
    }

    @PostMapping("/api/resume/student/{studentId}/education")
    @ResponseBody
    public ResponseEntity<?> saveEducation(@PathVariable Long studentId, @RequestBody Map<String, Object> payload) {
        return ok(studentCvService.saveEducation(studentId, payload), "Education details saved successfully!");
    }

    @PostMapping("/api/resume/student/{studentId}/skills")
    @ResponseBody
    public ResponseEntity<?> saveSkills(@PathVariable Long studentId, @RequestBody Map<String, Object> payload) {
        return ok(studentCvService.saveSkills(studentId, payload), "Technical skills saved successfully!");
    }

    @PostMapping("/api/resume/student/{studentId}/references")
    @ResponseBody
    public ResponseEntity<?> saveReferences(@PathVariable Long studentId, @RequestBody Map<String, Object> payload) {
        return ok(studentCvService.saveReferences(studentId, payload), "References saved successfully!");
    }

    @PostMapping("/api/resume/student/{studentId}/other")
    @ResponseBody
    public ResponseEntity<?> saveOther(@PathVariable Long studentId, @RequestBody Map<String, Object> payload) {
        return ok(studentCvService.saveOther(studentId, payload), "Other details saved successfully!");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseBody
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<?> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("Failed to process student CV request"));
    }

    private ResponseEntity<?> ok(Map<String, Object> data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return body;
    }
}
