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
public class UserTeacherController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/teacher", "/teacher/"})
    public String teachersReviews(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "teacher-review", "Teachers Reviews");
        return "user-teacher";
    }
}
