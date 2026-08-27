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
public class UserContentController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/content/list", "/content/list/"})
    public String contentList(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "download-center", "Content List", "contents");
        return "user-content";
    }

    @GetMapping({"/content", "/download-center/contents", "/download-center/content"})
    public String redirectContentList() {
        return "redirect:/user/content/list";
    }
}
