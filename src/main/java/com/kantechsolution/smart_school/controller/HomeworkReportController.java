package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class HomeworkReportController {

    @GetMapping("/homework/homeworkreport")
    public String homeworkReport(Model model) {
        return reportPage(model, "homework", "homeworkreport", "Homework Report", false);
    }

    @GetMapping("/homework/evaluation_report")
    public String evaluationReport(Model model) {
        return reportPage(model, "evaluation", "evaluation_report", "Homework Evaluation Report", false);
    }

    @GetMapping("/homework/homeworkordailyassignmentreport")
    public String dailyAssignmentReport(Model model) {
        return reportPage(model, "daily", "homeworkordailyassignmentreport", "Daily Assignment Report", true);
    }

    @GetMapping("/homework/homeworksmarksreport")
    public String marksReport(Model model) {
        return reportPage(model, "marks", "homeworksmarksreport", "Homework Marks Report", false);
    }

    @GetMapping("/report/homework")
    public RedirectView redirectHomeworkLanding() {
        return new RedirectView("/homework/homeworkreport");
    }

    @GetMapping("/report/homework/{reportKey}")
    public RedirectView redirectLegacyHomeworkReport(@PathVariable String reportKey) {
        return switch (reportKey.toLowerCase()) {
            case "evaluation_report", "homeworkevaluationreport" -> new RedirectView("/homework/evaluation_report");
            case "homeworkordailyassignmentreport", "dailyassignmentreport" ->
                    new RedirectView("/homework/homeworkordailyassignmentreport");
            case "homeworksmarksreport", "homeworkmarksreport" -> new RedirectView("/homework/homeworksmarksreport");
            default -> new RedirectView("/homework/homeworkreport");
        };
    }

    private String reportPage(Model model, String activeNav, String reportKey, String listTitle, boolean showSearchType) {
        model.addAttribute("pageTitle", "Homework Report - Smart School");
        model.addAttribute("activeNav", activeNav);
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("listTitle", listTitle);
        model.addAttribute("showSearchType", showSearchType);
        model.addAttribute("apiUrl", "/api/reports/homework/" + reportKey);
        return "homework-report";
    }
}
