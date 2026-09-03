package com.kantechsolution.smart_school.dashboard;

import com.kantechsolution.smart_school.support.AbstractIntegrationTest;
import com.kantechsolution.smart_school.support.TestAccounts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class AdminDashboardIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = TestAccounts.DEMO_ADMIN, roles = "ADMIN")
    void adminDashboardRenders() throws Exception {
        mockMvc.perform(get("/admin/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"));
    }

    @Test
    @WithMockUser(username = TestAccounts.DEMO_ADMIN, roles = "ADMIN")
    void chatPageRenders() throws Exception {
        mockMvc.perform(get("/admin/chat"))
                .andExpect(status().isOk())
                .andExpect(view().name("chat-system"));
    }
}
