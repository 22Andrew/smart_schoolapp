package com.kantechsolution.smart_school.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("appName", "Smart School");
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("appName", "Smart School");
        return "dashboard";
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        // Invalidate the session
        session.invalidate();
        // Redirect to login page
        return "redirect:/login";
    }
}
