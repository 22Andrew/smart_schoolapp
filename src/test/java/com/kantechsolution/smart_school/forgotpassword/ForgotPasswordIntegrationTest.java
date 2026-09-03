package com.kantechsolution.smart_school.forgotpassword;

import com.kantechsolution.smart_school.service.ForgotPasswordService;
import com.kantechsolution.smart_school.support.AbstractIntegrationTest;
import com.kantechsolution.smart_school.support.TestAccounts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class ForgotPasswordIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ForgotPasswordService forgotPasswordService;

    @Test
    void forgotPasswordPageIsPubliclyAccessible() throws Exception {
        mockMvc.perform(get("/forgot-password"))
                .andExpect(status().isOk())
                .andExpect(view().name("forgot-password"));
    }

    @Test
    void alternateForgotPasswordRouteWorks() throws Exception {
        mockMvc.perform(get("/site/forgotpassword"))
                .andExpect(status().isOk())
                .andExpect(view().name("forgot-password"));
    }

    @Test
    void submitForgotPasswordWithBlankEmailRedirectsBack() throws Exception {
        mockMvc.perform(post("/forgot-password").param("email", "").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/site/forgotpassword"));
    }

    @Test
    void submitForgotPasswordWithUnknownEmailRedirectsBack() throws Exception {
        mockMvc.perform(post("/forgot-password").param("email", "not-registered@example.com").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/site/forgotpassword"));
    }

    @Test
    void submitForgotPasswordWithKnownEmailRedirectsBack() throws Exception {
        mockMvc.perform(post("/forgot-password").param("email", TestAccounts.DEMO_ADMIN).with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/site/forgotpassword"));
    }

    @Test
    void invalidResetTokenRedirectsToForgotPasswordPage() throws Exception {
        mockMvc.perform(get("/reset-password/not-a-real-token"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/site/forgotpassword"));
    }

    @Test
    void findValidTokenReturnsEmptyForUnknownToken() {
        assertTrue(forgotPasswordService.findValidToken("unknown-token-value").isEmpty());
    }
}
