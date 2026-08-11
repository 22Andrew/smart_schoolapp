package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.PrintMarksheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PrintMarksheetController {

    private final PrintMarksheetService printMarksheetService;

    @GetMapping("/examresult/marksheet")
    public String showPrintMarksheetPage() {
        return "examresult-marksheet";
    }

    @GetMapping("/api/print-marksheets/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStudents(
            @RequestParam Long groupId,
            @RequestParam Long examId,
            @RequestParam String sessionYear,
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long templateId) {
        return ResponseEntity.ok(printMarksheetService.searchStudents(
                groupId, examId, sessionYear, classId, section, templateId));
    }
}
