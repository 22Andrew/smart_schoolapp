package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserPanelContextService;
import com.kantechsolution.smart_school.service.UserPanelOnlineExamService;
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
    public String redirectToView() {
        return "redirect:/user/onlineexam/view/" + UserPanelOnlineExamService.DEMO_VIEW_ID;
    }

    @GetMapping({"/onlineexam/view/{id}", "/onlineexam/view/{id}/"})
    public String onlineExam(Model model, Authentication authentication, @PathVariable Long id) {
        userPanelContextService.populateLayoutModel(model, authentication, "online-exam", "Online Exam");
        model.addAttribute("onlineExamViewId", id);
        return "user-onlineexam";
    }
}
