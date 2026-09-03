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
public class UserVideoTutorialController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/videotutorial", "/videotutorial/"})
    public String videoTutorialList(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "download-center", "Video Tutorial List", "video");
        return "user-videotutorial";
    }

    @GetMapping({"/video-tutorial", "/download-center/video-tutorial", "/download-center/videotutorial"})
    public String redirectVideoTutorial() {
        return "redirect:/user/videotutorial";
    }
}
