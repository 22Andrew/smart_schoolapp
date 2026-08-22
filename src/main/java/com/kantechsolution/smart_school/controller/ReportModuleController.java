package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.report.ReportCategoryDefinition;
import com.kantechsolution.smart_school.report.ReportDefinition;
import com.kantechsolution.smart_school.report.ReportLandingCatalog;
import com.kantechsolution.smart_school.service.ReportModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Controller
public class ReportModuleController {

    @Autowired
    private ReportModuleService reportModuleService;

    @GetMapping("/report/{category}")
    public RedirectView categoryDefault(@PathVariable String category) {
        if ("attendance".equalsIgnoreCase(category)) {
            return new RedirectView("/attendencereports/attendance");
        }
        if ("finance".equalsIgnoreCase(category)) {
            return new RedirectView("/admin/financereports/finance");
        }
        if ("examinations".equalsIgnoreCase(category)) {
            return new RedirectView("/admin/examresult/examinations");
        }
        if ("onlineexaminations".equalsIgnoreCase(category)) {
            return new RedirectView("/admin/onlineexam/report");
        }
        ReportCategoryDefinition categoryDef = reportModuleService.findCategory(category)
                .orElseThrow(() -> new IllegalArgumentException("Unknown report category"));
        ReportDefinition defaultReport = categoryDef.defaultReport();
        if (defaultReport == null) {
            throw new IllegalArgumentException("No reports configured for category");
        }
        return new RedirectView("/report/" + categoryDef.slug() + "/" + defaultReport.key());
    }

    @GetMapping("/report/{category}/{reportKey}")
    public String reportPage(@PathVariable String category,
                             @PathVariable String reportKey,
                             Model model) {
        ReportCategoryDefinition categoryDef = reportModuleService.findCategory(category)
                .orElseThrow(() -> new IllegalArgumentException("Unknown report category"));
        ReportDefinition report = categoryDef.findReport(reportKey);
        if (report == null) {
            throw new IllegalArgumentException("Unknown report type");
        }

        model.addAttribute("categorySlug", categoryDef.slug());
        model.addAttribute("categoryTitle", categoryDef.title());
        model.addAttribute("reports", categoryDef.reports());
        model.addAttribute("activeReport", report.key());
        model.addAttribute("listTitle", report.listTitle());
        model.addAttribute("showClassSection", report.showClassSection());
        model.addAttribute("showDateRange", report.showDateRange());
        model.addAttribute("needsSearch", report.needsSearch());
        model.addAttribute("showStaffAttendanceCriteria", report.showStaffAttendanceCriteria());
        model.addAttribute("showStaffDayWiseCriteria", report.showStaffDayWiseCriteria());
        model.addAttribute("showOnlineExamCriteria", report.showOnlineExamCriteria());
        model.addAttribute("showOnlineExamDateCriteria", report.showOnlineExamDateCriteria());
        model.addAttribute("showFinanceSearchTypeCriteria", report.showFinanceSearchTypeCriteria());
        model.addAttribute("showFinanceCollectionCriteria", report.showFinanceCollectionCriteria());
        model.addAttribute("showFinanceFeesStatementCriteria", report.showFinanceFeesStatementCriteria());
        model.addAttribute("showFinanceIncomeHeadCriteria", report.showFinanceIncomeHeadCriteria());
        model.addAttribute("showFinanceExpenseHeadCriteria", report.showFinanceExpenseHeadCriteria());
        model.addAttribute("apiUrl", "/api/reports/" + categoryDef.slug() + "/" + report.key());
        model.addAttribute("reportBasePath", "/report/" + categoryDef.slug());
        model.addAttribute("landingPath", "/report/" + categoryDef.slug());
        ReportLandingCatalog.findByCategorySlug(categoryDef.slug())
                .ifPresent(landing -> {
                    model.addAttribute("navItems", landing.items());
                    model.addAttribute("reportBasePath", landing.reportBasePath());
                    model.addAttribute("landingPath", landing.landingPath());
                });
        model.addAttribute("pageTitle", report.title() + " - Smart School");
        return "report-module";
    }

    @GetMapping("/api/reports/{category}/{reportKey}")
    @ResponseBody
    public ResponseEntity<?> runReport(@PathVariable String category,
                                       @PathVariable String reportKey,
                                       @RequestParam(required = false) Long classId,
                                       @RequestParam(required = false) String section,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                                       @RequestParam(required = false) Long categoryId,
                                       @RequestParam(required = false) String gender,
                                       @RequestParam(required = false) String rte,
                                       @RequestParam(required = false) String role,
                                       @RequestParam(required = false) Integer month,
                                       @RequestParam(required = false) Integer year,
                                       @RequestParam(required = false) String source,
                                       @RequestParam(required = false) Long examId,
                                       @RequestParam(required = false) String searchType,
                                       @RequestParam(required = false) String dateType,
                                       @RequestParam(required = false) String searchDuration,
                                       @RequestParam(required = false) Long studentId,
                                       @RequestParam(required = false) String incomeHead,
                                       @RequestParam(required = false) String expenseHead,
                                       @RequestParam(required = false) Long feeTypeId,
                                       @RequestParam(required = false) String collectBy,
                                       @RequestParam(required = false) String groupBy) {
        try {
            return ResponseEntity.ok(reportModuleService.runReport(
                    category, reportKey, classId, section, dateFrom, dateTo, categoryId, gender, rte, role, month, year,
                    source, examId, searchType, dateType, searchDuration, studentId, incomeHead, expenseHead,
                    feeTypeId, collectBy, groupBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBody("Failed to load report"));
        }
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        return body;
    }
}
