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
public class UserOnlineExamController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/onlineexam", "/onlineexam/"})
    public String onlineExamList(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "online-exam", "Online Exam");
        return "user-onlineexam";
    }

    @GetMapping({"/onlineexam/view/{id}", "/onlineexam/view/{id}/"})
    public String onlineExam(Model model, Authentication authentication, @PathVariable Long id) {
        userPanelContextService.populateLayoutModel(model, authentication, "online-exam", "Online Exam");
        model.addAttribute("onlineExamViewId", id);
        return "user-onlineexam";
    }
}
