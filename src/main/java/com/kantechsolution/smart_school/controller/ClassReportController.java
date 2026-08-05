package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller for Academics Class Timetable page
 */
@Controller
public class ClassReportController {

    @GetMapping("/classreport")
    public String showClassTimetablePage(Model model) {
        return "classreport";
    }

    @GetMapping("/timetable/create")
    public String showCreateTimetablePage(Model model) {
        return "timetable-create";
    }

    @GetMapping("/timetable/mytimetable")
    public String showTeacherTimetablePage(Model model) {
        return "mytimetable";
    }
}
