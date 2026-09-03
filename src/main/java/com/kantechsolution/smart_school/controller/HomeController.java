package com.kantechsolution.smart_school.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String welcome(Model model) {
        model.addAttribute("appName", "Smart School");
        model.addAttribute("tagline", "Empowering Education Through Technology");
        return "welcome";
    }
    
    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("appName", "Smart School");
        return "welcome";
    }
}
