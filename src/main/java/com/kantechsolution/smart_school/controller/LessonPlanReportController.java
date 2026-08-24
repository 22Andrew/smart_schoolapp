package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class LessonPlanReportController {

    @GetMapping("/report/lessonplan")
    public String syllabusStatusReport(Model model) {
        prepareModel(model, "syllabus", "syllabusstatusreport", false);
        return "lessonplan-report";
    }

    @GetMapping("/report/teachersyllabusstatus")
    public String subjectLessonPlanReport(Model model) {
        prepareModel(model, "subject", "subjectlessonreport", true);
        return "lessonplan-report";
    }

    @GetMapping("/report/lessonplan/{reportKey}")
    public RedirectView redirectLegacyLessonPlanReport(@PathVariable String reportKey) {
        if ("subjectlessonreport".equalsIgnoreCase(reportKey)) {
            return new RedirectView("/report/teachersyllabusstatus");
        }
        return new RedirectView("/report/lessonplan");
    }

    private void prepareModel(Model model, String activeTab, String reportKey, boolean showSubject) {
        model.addAttribute("pageTitle", "Lesson Plan Report - Smart School");
        model.addAttribute("activeTab", activeTab);
        model.addAttribute("reportKey", reportKey);
        model.addAttribute("showSubject", showSubject);
        model.addAttribute("apiUrl", "/api/reports/lessonplan/" + reportKey);
    }
}
