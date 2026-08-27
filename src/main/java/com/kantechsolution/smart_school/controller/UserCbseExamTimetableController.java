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
public class UserCbseExamTimetableController {

    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/cbse/exam/timetable", "/cbse/exam/timetable/"})
    public String cbseExamTimetable(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "cbse-exam",
                "CBSE Exam Timetable", "cbse-schedule");
        return "user-cbse-timetable";
    }

    @GetMapping({"/cbse-exam/schedule", "/cbse/exam/schedule", "/cbse/timetable"})
    public String redirectCbseExamTimetable() {
        return "redirect:/user/cbse/exam/timetable";
    }
}
