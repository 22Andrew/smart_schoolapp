package com.kantechsolution.smart_school.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        if (isUserLoginAttempt(request)) {
            getRedirectStrategy().sendRedirect(request, response, "/site/login?error");
            return;
        }
        getRedirectStrategy().sendRedirect(request, response, "/login?error");
    }

    private boolean isUserLoginAttempt(HttpServletRequest request) {
        return "user".equals(request.getParameter("loginType"));
    }
}
