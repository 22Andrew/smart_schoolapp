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
public class UserCbseExamResultController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/cbse/exam/result", "/cbse/exam/result/"})
    public String cbseExamResult(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "cbse-exam", "CBSE Exam Result", "cbse-result");
        return "user-cbse-result";
    }

    @GetMapping({"/cbse-exam/result", "/cbse/result"})
    public String redirectCbseExamResult() {
        return "redirect:/user/cbse/exam/result";
    }
}
