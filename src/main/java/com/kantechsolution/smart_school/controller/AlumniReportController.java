package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class AlumniReportController {

    @GetMapping("/report/alumnireport")
    public String alumniReportPage(Model model) {
        return reportPage(model, "alumnireport", "Alumni Report");
    }

    @GetMapping("/report/alumni")
    public RedirectView redirectAlumniLanding() {
        return new RedirectView("/report/alumnireport");
    }

    @GetMapping("/report/alumni/{reportKey}")
    public RedirectView redirectLegacyAlumniReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "alumnireport" -> new RedirectView("/report/alumnireport");
            case "alumnieventreport" -> new RedirectView("/report/alumnieventreport");
            default -> new RedirectView("/report/alumnireport");
        };
    }

    private String reportPage(Model model, String reportKey, String listTitle) {
        model.addAttribute("pageTitle", "Alumni Report - Smart School");
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("apiUrl", "/api/reports/alumni/" + reportKey);
        return "alumni-report";
    }
}
