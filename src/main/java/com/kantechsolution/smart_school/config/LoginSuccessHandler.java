package com.kantechsolution.smart_school.config;

import com.kantechsolution.smart_school.service.AuditTrailService;
import com.kantechsolution.smart_school.service.StaffSessionService;
import com.kantechsolution.smart_school.service.UserLogService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserLogService userLogService;
    private final AuditTrailService auditTrailService;
    private final StaffSessionService staffSessionService;

    public LoginSuccessHandler(UserLogService userLogService,
                               AuditTrailService auditTrailService,
                               StaffSessionService staffSessionService) {
        this.userLogService = userLogService;
        this.auditTrailService = auditTrailService;
        this.staffSessionService = staffSessionService;
        setDefaultTargetUrl("/admin/admin/dashboard");
        setAlwaysUseDefaultTargetUrl(true);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String username = authentication.getName();
        userLogService.recordLogin(username, request);
        auditTrailService.recordLogin(username, request);

        HttpSession session = request.getSession(true);
        session.setAttribute("user", staffSessionService.resolve(authentication));

        if (isStudentOrParent(authentication)) {
            getRedirectStrategy().sendRedirect(request, response, "/user/user/dashboard");
            return;
        }

        super.onAuthenticationSuccess(request, response, authentication);
    }

    private boolean isStudentOrParent(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> {
                    String value = authority.getAuthority();
                    return "ROLE_STUDENT".equals(value) || "ROLE_PARENT".equals(value);
                });
    }
}
