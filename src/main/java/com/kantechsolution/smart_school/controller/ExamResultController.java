package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ExamResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ExamResultController {

    private final ExamResultService examResultService;

    @GetMapping("/cbseexam/examresult")
    public String showExamResultPage() {
        return "cbseexam-examresult";
    }

    @GetMapping("/api/exam-results/sessions")
    @ResponseBody
    public ResponseEntity<List<String>> getSessionOptions() {
        return ResponseEntity.ok(examResultService.getSessionOptions());
    }

    @GetMapping("/api/exam-results/search")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchExamResults(
            @RequestParam Long groupId,
            @RequestParam Long examId,
            @RequestParam String sessionYear,
            @RequestParam Long classId,
            @RequestParam String section) {
        return ResponseEntity.ok(examResultService.searchResults(groupId, examId, sessionYear, classId, section));
    }
}
