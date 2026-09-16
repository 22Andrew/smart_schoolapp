package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String welcome(Model model) {
        return marketingPage(model, "home", "welcome");
    }

    @GetMapping("/home")
    public String home(Model model) {
        return marketingPage(model, "home", "welcome");
    }

    @GetMapping("/features")
    public String features(Model model) {
        return marketingPage(model, "features", "welcome-features");
    }

    @GetMapping("/how-it-works")
    public String howItWorks(Model model) {
        return marketingPage(model, "how-it-works", "welcome-how-it-works");
    }

    @GetMapping("/help")
    public String help(Model model) {
        return marketingPage(model, "help", "welcome-help");
    }

    @GetMapping("/support")
    public String support(Model model) {
        return marketingPage(model, "support", "welcome-support");
    }

    private String marketingPage(Model model, String activePage, String viewName) {
        model.addAttribute("appName", "Smart School");
        model.addAttribute("tagline", "Empowering Education Through Technology");
        model.addAttribute("activePage", activePage);
        return viewName;
    }
}
