package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CbseMarksheetService;
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
public class CbseMarksheetController {

    private final CbseMarksheetService cbseMarksheetService;

    @GetMapping("/cbseexam/result/marksheet")
    public String showMarksheetPage() {
        return "cbseexam-result-marksheet";
    }

    @GetMapping("/api/cbse-marksheets/templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getTemplateOptions() {
        return ResponseEntity.ok(cbseMarksheetService.getTemplateOptions());
    }

    @GetMapping("/api/cbse-marksheets/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStudents(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Long templateId) {
        return ResponseEntity.ok(cbseMarksheetService.searchStudents(classId, section, templateId));
    }
}
