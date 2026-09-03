package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping({"/dashboard", "/dashboard/"})
    public String dashboard(Model model, Authentication authentication) {
        adminDashboardService.populateDashboard(model, authentication);
        return "dashboard";
    }
}
