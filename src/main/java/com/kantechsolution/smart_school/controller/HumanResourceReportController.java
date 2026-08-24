package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class HumanResourceReportController {

    @GetMapping("/report/staffreport")
    public String staffReport(Model model) {
        return reportPage(model, "staff", "staffreport", "Staff Report");
    }

    @GetMapping("/admin/report/payrollreport")
    public String payrollReport(Model model) {
        return reportPage(model, "payroll", "payrollreport", "Payroll Report");
    }

    @GetMapping("/report/leavereaport")
    public String leaveRequestReport(Model model) {
        return reportPage(model, "leave", "leaverequestreport", "Leave Request Report");
    }

    @GetMapping("/report/myleaverequestreport")
    public String myLeaveRequestReport(Model model) {
        return reportPage(model, "myleave", "myleaverequestreport", "My Leave Request Report");
    }

    @GetMapping("/report/humanresource")
    public RedirectView redirectHumanResourceLanding() {
        return new RedirectView("/report/staffreport");
    }

    @GetMapping("/report/humanresource/{reportKey}")
    public RedirectView redirectLegacyHumanResourceReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "payrollreport" -> new RedirectView("/admin/report/payrollreport");
            case "leaverequestreport", "leaveapplicationreport" -> new RedirectView("/report/leavereaport");
            case "myleaverequestreport" -> new RedirectView("/report/myleaverequestreport");
            default -> new RedirectView("/report/staffreport");
        };
    }

    private String reportPage(Model model, String activeNav, String reportKey, String listTitle) {
        model.addAttribute("pageTitle", "Human Resource Report - Smart School");
        model.addAttribute("activeNav", activeNav);
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("apiUrl", "/api/reports/humanresource/" + reportKey);
        return "humanresource-report";
    }
}
