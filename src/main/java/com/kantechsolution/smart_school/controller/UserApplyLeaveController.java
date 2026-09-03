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
public class UserApplyLeaveController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/applyleav", "/applyleav/"})
    public String applyLeave(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "apply-leave", "Leave List");
        return "user-applyleave";
    }

    @GetMapping({"/apply_leave", "/applyleave", "/apply-leave"})
    public String redirectApplyLeave() {
        return "redirect:/user/applyleav";
    }
}
