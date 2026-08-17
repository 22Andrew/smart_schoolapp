package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseExamService;
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
public class CbseExamController {

    private final CbseExamService cbseExamService;

    @GetMapping("/cbseexam/exam")
    public String showCbseExamPage() {
        return "cbseexam-exam";
    }

    @GetMapping("/cbseexam/exam/examtimetable")
    public String showCbseExamTimetablePage() {
        return "cbseexam-exam-examtimetable";
    }

    @GetMapping("/api/cbse-exams/exam-timetable")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamTimetables() {
        return ResponseEntity.ok(cbseExamService.getExamTimetables());
    }

    @GetMapping("/cbseexam/report/examsubject")
    public String showCbseExamSubjectReportPage() {
        return "cbseexam-report-examsubject";
    }

    @GetMapping("/api/cbse-exam-reports/exam-options")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamReportOptions() {
        return ResponseEntity.ok(cbseExamService.getExamReportOptions());
    }

    @GetMapping("/api/cbse-exam-reports/exam-subject")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamSubjectReport(@RequestParam Long examId) {
        return ResponseEntity.ok(cbseExamService.getSubjectMarksReport(examId));
    }

    @GetMapping("/cbseexam/report/examtemplate")
    public String showCbseExamTemplateReportPage() {
        return "cbseexam-report-examtemplate";
    }

    @GetMapping("/api/cbse-exam-reports/template-options")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamTemplateOptions() {
        return ResponseEntity.ok(cbseExamService.getTemplateReportOptions());
    }

    @GetMapping("/api/cbse-exam-reports/exam-template")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamTemplateReport(@RequestParam Long classId,
                                                                           @RequestParam String section,
                                                                           @RequestParam String templateId) {
        try {
            return ResponseEntity.ok(cbseExamService.getTemplateMarksReport(classId, section, templateId));
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/cbse-exams")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExams() {
        return ResponseEntity.ok(cbseExamService.getAllExams());
    }

    @GetMapping("/api/cbse-exams/options")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamOptions() {
        return ResponseEntity.ok(cbseExamService.getFormOptions());
    }

    @GetMapping("/api/cbse-exams/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExam(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamService.getExamDetails(id));
    }

    @PostMapping("/api/cbse-exams")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createCbseExam(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamService.saveExam(body), "Exam saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/cbse-exams/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCbseExam(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return saveResponse(() -> cbseExamService.updateExam(id, body), "Exam updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/cbse-exams/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCbseExam(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cbseExamService.deleteExam(id);
            response.put("success", true);
            response.put("message", "Exam deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/api/cbse-exams/{id}/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getCbseExamStudents(
            @PathVariable Long id,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(cbseExamService.getAssignableStudents(id, classId, section));
    }

    @PutMapping("/api/cbse-exams/{id}/students")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveCbseExamStudents(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        @SuppressWarnings("unchecked")
        List<Number> ids = (List<Number>) body.get("studentIds");
        List<Long> studentIds = ids == null ? List.of() : ids.stream().map(Number::longValue).toList();
        cbseExamService.saveAssignedStudents(id, studentIds);
        response.put("success", true);
        response.put("message", "Students assigned successfully!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/cbse-exams/{id}/subjects")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamSubjects(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamService.getExamSubjects(id));
    }

    @PutMapping("/api/cbse-exams/{id}/subjects")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveCbseExamSubjects(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rows = (List<Map<String, Object>>) body.get("subjects");
            Map<String, Object> data = cbseExamService.saveExamSubjects(id, rows);
            response.put("success", true);
            response.put("message", "Exam subjects saved successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/api/cbse-exams/{id}/marks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamMarks(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamService.getExamMarksView(id));
    }

    @GetMapping("/api/cbse-exams/{id}/attendance")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamAttendance(@PathVariable Long id,
                                                                     @RequestParam(required = false) String fromDate,
                                                                     @RequestParam(required = false) String toDate) {
        return ResponseEntity.ok(cbseExamService.searchExamAttendance(id, fromDate, toDate));
    }

    @GetMapping("/api/cbse-exams/{id}/teacher-remarks")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamTeacherRemarks(@PathVariable Long id) {
        return ResponseEntity.ok(cbseExamService.getTeacherRemarks(id));
    }

    @GetMapping("/api/cbse-exams/{id}/generate-rank")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCbseExamGenerateRank(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            return ResponseEntity.ok(cbseExamService.getGenerateRankData(id));
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to load rank data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/cbse-exams/{id}/generate-rank")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> generateCbseExamRank(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = cbseExamService.generateRank(id);
            response.put("success", true);
            response.put("message", "Rank generated successfully!");
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to generate rank: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> saveResponse(SaveAction action, String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.run();
            response.put("success", true);
            response.put("message", message);
            response.put("data", data);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }
}
