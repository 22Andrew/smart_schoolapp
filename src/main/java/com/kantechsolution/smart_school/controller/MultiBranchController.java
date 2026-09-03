package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.BranchService;
import com.kantechsolution.smart_school.service.MultiBranchOverviewService;
import com.kantechsolution.smart_school.service.MultiBranchReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class MultiBranchController {

    @Autowired
    private BranchService branchService;

    @Autowired
    private MultiBranchReportService multiBranchReportService;

    @Autowired
    private MultiBranchOverviewService multiBranchOverviewService;

    @GetMapping("/multibranch/branch")
    public String showBranchSettingPage() {
        return "multibranch-branch";
    }

    @GetMapping("/multibranch/branch/overview")
    public String showBranchOverviewPage() {
        return "multibranch-overview";
    }

    @GetMapping("/multibranch/finance/dailycollectionreport")
    public String showDailyCollectionReportPage(Model model) {
        return financeReportPage(model, "daily-collection", "Daily Collection Report");
    }

    @GetMapping("/multibranch/finance/payrollreport")
    public String showPayrollReportPage(Model model) {
        return financeReportPage(model, "payroll", "Payroll Report");
    }

    @GetMapping("/multibranch/finance/incomereport")
    public String showIncomeReportPage(Model model) {
        return financeReportPage(model, "income", "Income Report");
    }

    @GetMapping("/multibranch/finance/expensereport")
    public String showExpenseReportPage(Model model) {
        return financeReportPage(model, "expense", "Expense Report");
    }

    @GetMapping("/multibranch/finance/userlogreport")
    public String showUserLogReportPage(Model model) {
        return financeReportPage(model, "user-log", "User Log Report");
    }

    private String financeReportPage(Model model, String activeReport, String listTitle) {
        model.addAttribute("activeReport", activeReport);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("pageTitle", "Multi Branch Report - Smart School");
        return "multibranch-finance-report";
    }

    @GetMapping("/api/multibranch/branches")
    @ResponseBody
    public ResponseEntity<?> listBranches() {
        return ResponseEntity.ok(branchService.listAll());
    }

    @PostMapping("/api/multibranch/branches")
    @ResponseBody
    public ResponseEntity<?> createBranch(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(branchService.create(body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/api/multibranch/branches/{id}")
    @ResponseBody
    public ResponseEntity<?> updateBranch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(branchService.update(id, body));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/api/multibranch/branches/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteBranch(@PathVariable Long id) {
        try {
            branchService.delete(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/api/multibranch/reports/daily-collection")
    @ResponseBody
    public ResponseEntity<?> dailyCollectionSummary(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        return ResponseEntity.ok(multiBranchReportService.dailyCollectionSummary(dateFrom, dateTo));
    }

    @GetMapping("/api/multibranch/reports/daily-collection/{date}/details")
    @ResponseBody
    public ResponseEntity<?> dailyCollectionDetails(@PathVariable String date) {
        return ResponseEntity.ok(multiBranchReportService.dailyCollectionDetails(date));
    }

    @GetMapping("/api/multibranch/overview")
    @ResponseBody
    public ResponseEntity<?> getOverviewData() {
        return ResponseEntity.ok(multiBranchOverviewService.getOverviewData());
    }

    @GetMapping("/api/multibranch/reports/{reportType}")
    @ResponseBody
    public ResponseEntity<?> reportSummary(
            @PathVariable String reportType,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        return ResponseEntity.ok(multiBranchReportService.summary(reportType, dateFrom, dateTo));
    }

    @GetMapping("/api/multibranch/reports/{reportType}/{date}/details")
    @ResponseBody
    public ResponseEntity<?> reportDetails(
            @PathVariable String reportType,
            @PathVariable String date) {
        return ResponseEntity.ok(multiBranchReportService.details(reportType, date));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
