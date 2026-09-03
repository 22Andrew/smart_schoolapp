package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserSyllabusController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping("/syllabus")
    public String lessonPlan(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "lesson-plan", "Lesson Plan");
        return "user-syllabus";
    }

    @GetMapping("/syllabus/status")
    public String syllabusStatus(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "syllabus", "Syllabus Status");
        return "user-syllabus-status";
    }
}
