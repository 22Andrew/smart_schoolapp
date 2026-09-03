package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.report.ReportCategoryDefinition;
import com.kantechsolution.smart_school.report.ReportDefinition;
import com.kantechsolution.smart_school.report.ReportLandingCatalog;
import com.kantechsolution.smart_school.report.ReportLandingPage;
import com.kantechsolution.smart_school.service.ReportModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class ReportLandingController {

    @Autowired
    private ReportModuleService reportModuleService;

    @GetMapping("/attendencereports/attendance")
    public String attendanceLanding(Model model) {
        return landingPage(model, "attendance");
    }

    @GetMapping("/attendencereports/attendance/{reportKey}")
    public String attendanceReport(@PathVariable String reportKey, Model model) {
        return reportPage(model, "attendance", reportKey, "/attendencereports/attendance");
    }

    @GetMapping("/admin/financereports/finance")
    public String financeLanding(Model model) {
        return landingPage(model, "finance");
    }

    @GetMapping("/admin/financereports/finance/{reportKey}")
    public String financeReport(@PathVariable String reportKey, Model model) {
        return reportPage(model, "finance", reportKey, "/admin/financereports/finance");
    }

    @GetMapping("/financereports/studentacademicreport")
    public String studentAcademicReport(Model model) {
        return reportPage(model, "finance", "studentacademicreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/payroll")
    public String payrollReport(Model model) {
        return reportPage(model, "finance", "payrollreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/onlineadmission")
    public String onlineAdmissionFeesReport(Model model) {
        return reportPage(model, "finance", "onlineadmissionfeescollectionreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/collection_report")
    public String feesCollectionReport(Model model) {
        return reportPage(model, "finance", "feescollectionreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/income")
    public String incomeReport(Model model) {
        return reportPage(model, "finance", "incomereport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/incomegroup")
    public String incomeGroupReport(Model model) {
        return reportPage(model, "finance", "incomegroupreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/reportbyname")
    public String feesStatementReport(Model model) {
        return reportPage(model, "finance", "feesstatement", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/onlinefeesreporte")
    public String onlineFeesCollectionReport(Model model) {
        return reportPage(model, "finance", "onlinefeescollectionreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/expense")
    public String expenseReport(Model model) {
        return reportPage(model, "finance", "expensereport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/expensegroup")
    public String expenseGroupReport(Model model) {
        return reportPage(model, "finance", "expensegroupreport", "/admin/financereports/finance");
    }

    @GetMapping("/financereports/incomeexpensebalancereport")
    public String incomeExpenseBalanceReport(Model model) {
        return reportPage(model, "finance", "incomeexpensebalancereport", "/admin/financereports/finance");
    }

    @GetMapping("/admin/financereports/finance/balancefeesreport")
    public RedirectView redirectLegacyBalanceFeesReport() {
        return new RedirectView("/financereports/studentacademicreport");
    }

    @GetMapping("/admin/financereports/finance/payrollreport")
    public RedirectView redirectLegacyPayrollReport() {
        return new RedirectView("/financereports/payroll");
    }

    @GetMapping("/admin/financereports/finance/onlineadmissionfeescollectionreport")
    public RedirectView redirectLegacyOnlineAdmissionReport() {
        return new RedirectView("/financereports/onlineadmission");
    }

    @GetMapping("/admin/financereports/finance/feescollectionreport")
    public RedirectView redirectLegacyFeesCollectionReport() {
        return new RedirectView("/financereports/collection_report");
    }

    @GetMapping("/admin/financereports/finance/incomereport")
    public RedirectView redirectLegacyIncomeReport() {
        return new RedirectView("/financereports/income");
    }

    @GetMapping("/admin/financereports/finance/incomegroupreport")
    public RedirectView redirectLegacyIncomeGroupReport() {
        return new RedirectView("/financereports/incomegroup");
    }

    @GetMapping("/admin/financereports/finance/feesstatement")
    public RedirectView redirectLegacyFeesStatementReport() {
        return new RedirectView("/financereports/reportbyname");
    }

    @GetMapping("/admin/financereports/finance/onlinefeescollectionreport")
    public RedirectView redirectLegacyOnlineFeesCollectionReport() {
        return new RedirectView("/financereports/onlinefeesreporte");
    }

    @GetMapping("/admin/financereports/finance/expensereport")
    public RedirectView redirectLegacyExpenseReport() {
        return new RedirectView("/financereports/expense");
    }

    @GetMapping("/admin/financereports/finance/expensegroupreport")
    public RedirectView redirectLegacyExpenseGroupReport() {
        return new RedirectView("/financereports/expensegroup");
    }

    @GetMapping("/admin/financereports/finance/incomeexpensebalancereport")
    public RedirectView redirectLegacyIncomeExpenseBalanceReport() {
        return new RedirectView("/financereports/incomeexpensebalancereport");
    }

    @GetMapping("/admin/examresult/examinations")
    public String examinationsLanding(Model model) {
        return landingPage(model, "examinations");
    }

    @GetMapping("/admin/examresult/examinations/{reportKey}")
    public String examinationsReport(@PathVariable String reportKey, Model model) {
        return reportPage(model, "examinations", reportKey, "/admin/examresult/examinations");
    }

    @GetMapping("/admin/onlineexam/report")
    public String onlineExamReportDefault(Model model) {
        return reportPage(model, "onlineexaminations", "resultreport", "/admin/onlineexam/report");
    }

    @GetMapping("/admin/onlineexam/report/{reportKey}")
    public String onlineExamReport(@PathVariable String reportKey, Model model) {
        return reportPage(model, "onlineexaminations", reportKey, "/admin/onlineexam/report");
    }

    @GetMapping("/report/attendance")
    public RedirectView redirectAttendance() {
        return new RedirectView("/attendencereports/attendance");
    }

    @GetMapping("/report/finance")
    public RedirectView redirectFinance() {
        return new RedirectView("/admin/financereports/finance");
    }

    @GetMapping("/report/examinations")
    public RedirectView redirectExaminations() {
        return new RedirectView("/admin/examresult/examinations");
    }

    @GetMapping("/report/onlineexaminations")
    public RedirectView redirectOnlineExaminations() {
        return new RedirectView("/admin/onlineexam/report");
    }

    private String landingPage(Model model, String categorySlug) {
        ReportLandingPage landing = ReportLandingCatalog.findByCategorySlug(categorySlug)
                .orElseThrow(() -> new IllegalArgumentException("Unknown report landing page"));
        model.addAttribute("pageTitle", landing.pageTitle() + " - Smart School");
        model.addAttribute("landingTitle", landing.pageTitle());
        model.addAttribute("landingPath", landing.landingPath());
        model.addAttribute("landingItems", landing.items());
        return "report-landing";
    }

    private String reportPage(Model model, String categorySlug, String reportKey, String reportBasePath) {
        ReportCategoryDefinition categoryDef = reportModuleService.findCategory(categorySlug)
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
        model.addAttribute("reportBasePath", reportBasePath);
        model.addAttribute("landingPath", reportBasePath);
        ReportLandingCatalog.findByCategorySlug(categorySlug)
                .ifPresent(landing -> model.addAttribute("navItems", landing.items()));
        model.addAttribute("pageTitle", report.title() + " - Smart School");
        return "report-module";
    }
}
