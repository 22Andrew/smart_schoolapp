package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class HostelReportController {

    @GetMapping("/admin/hostelroom/studenthosteldetails")
    public String studentHostelDetails(Model model) {
        return reportPage(model, "studenthosteldetails", "Student Hostel Report");
    }

    @GetMapping("/report/hostel")
    public RedirectView redirectHostelLanding() {
        return new RedirectView("/admin/hostelroom/studenthosteldetails");
    }

    @GetMapping("/report/hostel/{reportKey}")
    public RedirectView redirectLegacyHostelReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "studenthosteldetails", "hostelstudentreport" -> new RedirectView("/admin/hostelroom/studenthosteldetails");
            default -> new RedirectView("/admin/hostelroom/studenthosteldetails");
        };
    }

    private String reportPage(Model model, String reportKey, String listTitle) {
        model.addAttribute("pageTitle", "Student Hostel Report - Smart School");
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("apiUrl", "/api/reports/hostel/" + reportKey);
        return "hostel-report";
    }
}
