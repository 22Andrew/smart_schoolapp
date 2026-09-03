package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.PrintAdmitCardService;
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
public class PrintAdmitCardController {

    private final PrintAdmitCardService printAdmitCardService;

    @GetMapping("/examresult/admitcard")
    public String showPrintAdmitCardPage() {
        return "examresult-admitcard";
    }

    @GetMapping("/api/print-admit-cards/students")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchStudents(
            @RequestParam Long groupId,
            @RequestParam Long examId,
            @RequestParam String sessionYear,
            @RequestParam Long classId,
            @RequestParam String section) {
        return ResponseEntity.ok(printAdmitCardService.searchStudents(
                groupId, examId, sessionYear, classId, section));
    }
}
