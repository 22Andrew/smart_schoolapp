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
public class UserNotificationController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/notification", "/notification/"})
    public String notification(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "notice-board", "Notice Board");
        return "user-notification";
    }

    @GetMapping({"/notice-board"})
    public String redirectLegacyNoticeBoard() {
        return "redirect:/user/notification";
    }
}
