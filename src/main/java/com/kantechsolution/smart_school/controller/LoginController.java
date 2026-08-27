package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.LoginPageService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class LoginController {

    private final LoginPageService loginPageService;

    @GetMapping("/login")
    public String login(Model model) {
        loginPageService.populateLoginModel(model);
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "redirect:/admin/admin/dashboard";
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        // Invalidate the session
        session.invalidate();
        // Redirect to login page
        return "redirect:/login";
    }
}
