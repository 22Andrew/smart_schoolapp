package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserStudentCourseController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping("/studentcourse")
    public String studentCourse(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "online-course", "Course List");
        return "user-studentcourse";
    }

    @GetMapping("/studentcourse/course/{courseId}")
    public String studentCoursePlayer(
            Model model,
            Authentication authentication,
            @PathVariable Long courseId
    ) {
        userPanelContextService.populateLayoutModel(model, authentication, "online-course", "Course");
        model.addAttribute("courseId", courseId);
        return "user-studentcourse-player";
    }
}
