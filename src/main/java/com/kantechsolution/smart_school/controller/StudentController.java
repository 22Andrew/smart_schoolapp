package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller for Student Information pages
 */
@Controller
public class StudentController {

    /**
     * Show student search / student details page
     */
    @GetMapping("/student/search")
    public String showStudentSearchPage(Model model) {
        return "student-search";
    }

    /**
     * Show student admission / create page
     */
    @GetMapping("/student/create")
    public String showStudentCreatePage(Model model) {
        return "student-create";
    }

    /**
     * Show online admission / student list page
     */
    @GetMapping("/student/onlinestudent")
    public String showOnlineStudentPage(Model model) {
        return "student-online";
    }

    /**
     * Show disabled students list page
     */
    @GetMapping("/student/disablestudentslist")
    public String showDisabledStudentsPage(Model model) {
        return "student-disabled";
    }
}
