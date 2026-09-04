package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.ForgotPasswordService;
import com.kantechsolution.smart_school.service.LoginPageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final LoginPageService loginPageService;
    private final ForgotPasswordService forgotPasswordService;

    @GetMapping({"/site/forgotpassword", "/forgot-password"})
    public String forgotPasswordForm(Model model) {
        loginPageService.populateLoginModel(model);
        return "forgot-password";
    }

    @PostMapping({"/site/forgotpassword", "/forgot-password"})
    public String submitForgotPassword(@RequestParam("email") String email,
                                       HttpServletRequest request,
                                       RedirectAttributes redirectAttributes) {
        try {
            forgotPasswordService.requestPasswordReset(email, request);
            redirectAttributes.addFlashAttribute("successMessage",
                    "Please check your email. If your account is registered, you will receive a password reset link shortly.");
        } catch (IllegalArgumentException error) {
            redirectAttributes.addFlashAttribute("errorMessage", error.getMessage());
        }
        return "redirect:/site/forgotpassword";
    }

    @GetMapping({"/site/resetpassword/{token}", "/reset-password/{token}"})
    public String resetPasswordForm(@PathVariable("token") String token, Model model, RedirectAttributes redirectAttributes) {
        loginPageService.populateLoginModel(model);
        return forgotPasswordService.findValidToken(token)
                .map(resetToken -> {
                    model.addAttribute("token", resetToken.getToken());
                    return "reset-password";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("errorMessage",
                            "This password reset link is invalid or has expired.");
                    return "redirect:/site/forgotpassword";
                });
    }

    @PostMapping({"/site/resetpassword/{token}", "/reset-password/{token}"})
    public String submitResetPassword(@PathVariable("token") String token,
                                      @RequestParam("password") String password,
                                      @RequestParam("confirmPassword") String confirmPassword,
                                      RedirectAttributes redirectAttributes) {
        try {
            String accountType = forgotPasswordService.resetPassword(token, password, confirmPassword);
            redirectAttributes.addFlashAttribute("successMessage", "Your password has been reset successfully. Please sign in.");
            if (ForgotPasswordService.TYPE_STAFF.equals(accountType)) {
                return "redirect:/login";
            }
            return "redirect:/site/login";
        } catch (IllegalArgumentException error) {
            redirectAttributes.addFlashAttribute("errorMessage", error.getMessage());
            return "redirect:/site/resetpassword/" + token;
        }
    }
}
