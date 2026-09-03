package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class LibraryReportController {

    @GetMapping("/report/studentbookissuereport")
    public String bookIssueReport(Model model) {
        return reportPage(model, "issue", "studentbookissuereport", "Book Issue Report", true, false);
    }

    @GetMapping("/report/bookduereport")
    public String bookDueReport(Model model) {
        return reportPage(model, "due", "bookduereport", "Book Due Report", true, false);
    }

    @GetMapping("/report/bookinventory")
    public String bookInventoryReport(Model model) {
        return reportPage(model, "inventory", "bookinventory", "Book Inventory Report", false, true);
    }

    @GetMapping("/admin/book/issuereturnreport")
    public String bookIssueReturnReport(Model model) {
        return reportPage(model, "return", "issuereturnreport", "Book Issue Return Report", false, true);
    }

    @GetMapping("/report/library")
    public RedirectView redirectLibraryLanding() {
        return new RedirectView("/report/studentbookissuereport");
    }

    @GetMapping("/report/library/{reportKey}")
    public RedirectView redirectLegacyLibraryReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "bookduereport" -> new RedirectView("/report/bookduereport");
            case "bookinventory", "bookinventoryreport" -> new RedirectView("/report/bookinventory");
            case "issuereturnreport", "bookissuereturnreport" -> new RedirectView("/admin/book/issuereturnreport");
            case "studentbookissuereport", "bookissuereport" -> new RedirectView("/report/studentbookissuereport");
            default -> new RedirectView("/report/studentbookissuereport");
        };
    }

    private String reportPage(Model model, String activeNav, String reportKey, String listTitle,
                              boolean showMemberType, boolean searchTypeOnly) {
        model.addAttribute("pageTitle", "Library Report - Smart School");
        model.addAttribute("activeNav", activeNav);
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("showMemberType", showMemberType);
        model.addAttribute("searchTypeOnly", searchTypeOnly);
        model.addAttribute("apiUrl", "/api/reports/library/" + reportKey);
        return "library-report";
    }
}
