package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LoginPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class SiteLoginController {

    private final LoginPageService loginPageService;

    @GetMapping({"/site/login", "/user-login"})
    public String userLogin(Model model) {
        loginPageService.populateLoginModel(model);
        return "site-login";
    }

    @GetMapping("/user/dashboard")
    public String userDashboardRedirect() {
        return "redirect:/user/user/dashboard";
    }
}
