package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class TransportReportController {

    @GetMapping("/admin/route/studenttransportdetails")
    public String studentTransportDetails(Model model) {
        return reportPage(model, "studenttransportdetails", "Student Transport Report");
    }

    @GetMapping("/report/transport")
    public RedirectView redirectTransportLanding() {
        return new RedirectView("/admin/route/studenttransportdetails");
    }

    @GetMapping("/report/transport/{reportKey}")
    public RedirectView redirectLegacyTransportReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "studenttransportdetails", "studenttransportreport" -> new RedirectView("/admin/route/studenttransportdetails");
            default -> new RedirectView("/admin/route/studenttransportdetails");
        };
    }

    private String reportPage(Model model, String reportKey, String listTitle) {
        model.addAttribute("pageTitle", "Student Transport Report - Smart School");
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("apiUrl", "/api/reports/transport/" + reportKey);
        return "transport-report";
    }
}

