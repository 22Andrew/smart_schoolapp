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
public class UserHomeworkController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/homework", "/homework/"})
    public String homework(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "homework", "Homework");
        return "user-homework";
    }

    @GetMapping({"/dailyassignment", "/dailyassignment/"})
    public String dailyAssignment(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "homework", "Daily Assignment");
        return "user-dailyassignment";
    }
}
