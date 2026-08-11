package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.OnlineExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class OnlineExamController {

    private final OnlineExamService onlineExamService;

    @GetMapping("/onlineexam")
    public String showOnlineExamPage() {
        return "onlineexam";
    }

    @GetMapping("/question")
    public String showQuestionBankPage() {
        return "question";
    }

    @GetMapping("/api/online-exams")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listExams(
            @RequestParam(defaultValue = "upcoming") String status) {
        return ResponseEntity.ok(onlineExamService.listExams(status));
    }

    @GetMapping("/api/online-exams/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getExam(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(onlineExamService.getExam(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/online-exams")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createExam(@RequestBody Map<String, Object> body) {
        return saveResponse(() -> onlineExamService.createExam(body), "Exam saved successfully!", HttpStatus.CREATED);
    }

    @PutMapping("/api/online-exams/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateExam(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return saveResponse(() -> onlineExamService.updateExam(id, body), "Exam updated successfully!", HttpStatus.OK);
    }

    @DeleteMapping("/api/online-exams/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteExam(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            onlineExamService.deleteExam(id);
            response.put("success", true);
            response.put("message", "Exam deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/api/online-exams/bulk-delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Long> ids = (List<Long>) body.get("ids");
            Map<String, Object> result = onlineExamService.bulkDeleteExams(ids);
            response.put("success", true);
            response.put("message", "Selected exams deleted successfully!");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/online-exams/{id}/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStudentsForAssign(
            @PathVariable Long id,
            @RequestParam Long classId,
            @RequestParam String section) {
        return ResponseEntity.ok(onlineExamService.searchStudentsForAssign(classId, section, id));
    }

    @PostMapping("/api/online-exams/{id}/students")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAssignedStudents(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Long> studentIds = parseStudentIds(body.get("studentIds"));
            onlineExamService.saveAssignedStudents(id, studentIds);
            response.put("success", true);
            response.put("message", "Students assigned successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to assign students: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private List<Long> parseStudentIds(Object raw) {
        List<Long> studentIds = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object value : list) {
                if (value == null || String.valueOf(value).isBlank()) {
                    continue;
                }
                studentIds.add(Long.valueOf(String.valueOf(value).trim()));
            }
        }
        return studentIds;
    }

    @PostMapping("/api/online-exams/questions/search")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchQuestions(@RequestBody Map<String, Object> filters) {
        return ResponseEntity.ok(onlineExamService.searchQuestionsForSelect(filters));
    }

    @GetMapping("/api/online-exams/{id}/questions")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamQuestions(
            @PathVariable Long id,
            @RequestParam(required = false) String subject) {
        return ResponseEntity.ok(onlineExamService.getExamQuestions(id, subject));
    }

    @GetMapping("/api/online-exams/{id}/question-subjects")
    @ResponseBody
    public ResponseEntity<List<String>> getExamQuestionSubjects(@PathVariable Long id) {
        return ResponseEntity.ok(onlineExamService.getExamQuestionSubjects(id));
    }

    @PostMapping("/api/online-exams/{id}/questions")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addQuestions(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questions = (List<Map<String, Object>>) body.get("questions");
            onlineExamService.addQuestionsToExam(id, questions);
            response.put("success", true);
            response.put("message", "Questions added successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/api/online-exams/{examId}/questions/{questionId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> removeQuestion(
            @PathVariable Long examId,
            @PathVariable Long questionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            onlineExamService.removeQuestionFromExam(examId, questionId);
            response.put("success", true);
            response.put("message", "Question removed successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> saveResponse(
            java.util.concurrent.Callable<Map<String, Object>> action,
            String successMessage,
            HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = action.call();
            response.put("success", true);
            response.put("message", successMessage);
            response.put("data", saved);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save exam: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
