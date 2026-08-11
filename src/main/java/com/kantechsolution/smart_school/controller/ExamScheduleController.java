package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ExamGroupService;
import com.kantechsolution.smart_school.service.ExamScheduleService;
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
public class ExamScheduleController {

    private final ExamScheduleService examScheduleService;
    private final ExamGroupService examGroupService;

    @GetMapping("/cbseexam/exam/examschedule")
    public String showExamSchedulePage() {
        return "cbseexam-exam-examschedule";
    }

    @GetMapping("/api/exam-schedules/groups")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamGroupOptions() {
        return ResponseEntity.ok(examGroupService.getExamGroupOptions());
    }

    @GetMapping("/api/exam-schedules/groups/{groupId}/exams")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getExamsByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(examGroupService.getExamsByGroupId(groupId));
    }

    @GetMapping("/api/exam-schedules/search")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchExamSchedule(
            @RequestParam Long groupId,
            @RequestParam Long examId) {
        return ResponseEntity.ok(examScheduleService.searchSchedule(groupId, examId));
    }
}
