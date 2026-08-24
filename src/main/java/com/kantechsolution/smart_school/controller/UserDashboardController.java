package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.UserDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user/user")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService userDashboardService;

    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication authentication) {
        userDashboardService.populateDashboardModel(model, authentication);
        return "user-dashboard";
    }
}
