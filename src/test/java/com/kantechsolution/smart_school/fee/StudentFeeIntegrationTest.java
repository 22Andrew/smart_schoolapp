package com.kantechsolution.smart_school.fee;

import com.kantechsolution.smart_school.support.AbstractIntegrationTest;
import com.kantechsolution.smart_school.support.TestAccounts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class StudentFeeIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void collectFeesPageRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/studentfee"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void authenticatedAdminCanOpenCollectFeesPage() throws Exception {
        mockMvc.perform(get("/studentfee")
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(view().name("studentfee"));
    }

    @Test
    void studentFeesApiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/student-fees/1"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void authenticatedAdminCanLoadStudentFeesForDemoStudent() throws Exception {
        mockMvc.perform(get("/api/student-fees/1")
                        .accept(MediaType.APPLICATION_JSON)
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.student").exists())
                .andExpect(jsonPath("$.sessionYear", notNullValue()))
                .andExpect(jsonPath("$.fees").isArray());
    }

    @Test
    void authenticatedAdminCanOpenQuickFeesPage() throws Exception {
        mockMvc.perform(get("/studentfee/quickfees")
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(view().name("studentfee-quickfees"));
    }

    @Test
    void paymentSearchApiRejectsBlankPaymentId() throws Exception {
        mockMvc.perform(get("/api/fee-payments/search")
                        .param("paymentId", " ")
                        .accept(MediaType.APPLICATION_JSON)
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Payment ID is required"));
    }
}
