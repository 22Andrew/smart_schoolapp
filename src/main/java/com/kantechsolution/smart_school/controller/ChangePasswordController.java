package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ChangePasswordService;
import com.kantechsolution.smart_school.service.UserPanelContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class ChangePasswordController {

    private final ChangePasswordService changePasswordService;
    private final UserPanelContextService userPanelContextService;

    @GetMapping({"/admin/admin/changepass", "/admin/admin/changepass/"})
    public String adminChangePasswordPage() {
        return "changepass";
    }

    @PostMapping("/admin/admin/changepass")
    public String adminChangePasswordSubmit(@RequestParam("currentPassword") String currentPassword,
                                            @RequestParam("newPassword") String newPassword,
                                            @RequestParam("confirmPassword") String confirmPassword,
                                            Authentication authentication,
                                            RedirectAttributes redirectAttributes) {
        return handleSubmit(currentPassword, newPassword, confirmPassword, authentication, redirectAttributes,
                "/admin/admin/changepass");
    }

    @GetMapping({"/user/changepass", "/user/changepass/"})
    public String userChangePasswordPage(Model model, Authentication authentication) {
        userPanelContextService.populateLayoutModel(model, authentication, "profile", "Change Password");
        return "changepass-user";
    }

    @PostMapping("/user/changepass")
    public String userChangePasswordSubmit(@RequestParam("currentPassword") String currentPassword,
                                           @RequestParam("newPassword") String newPassword,
                                           @RequestParam("confirmPassword") String confirmPassword,
                                           Authentication authentication,
                                           RedirectAttributes redirectAttributes) {
        return handleSubmit(currentPassword, newPassword, confirmPassword, authentication, redirectAttributes,
                "/user/changepass");
    }

    private String handleSubmit(String currentPassword,
                                String newPassword,
                                String confirmPassword,
                                Authentication authentication,
                                RedirectAttributes redirectAttributes,
                                String redirectPath) {
        try {
            changePasswordService.changePassword(authentication, currentPassword, newPassword, confirmPassword);
            redirectAttributes.addFlashAttribute("successMessage", "Password changed successfully.");
        } catch (IllegalArgumentException ex) {
            redirectAttributes.addFlashAttribute("errorMessage", ex.getMessage());
        }
        return "redirect:" + redirectPath;
    }
}
