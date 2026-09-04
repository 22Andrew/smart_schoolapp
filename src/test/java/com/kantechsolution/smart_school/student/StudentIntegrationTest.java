package com.kantechsolution.smart_school.student;

import com.kantechsolution.smart_school.support.AbstractIntegrationTest;
import com.kantechsolution.smart_school.support.TestAccounts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class StudentIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void studentSearchPageRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/student/search"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void authenticatedAdminCanOpenStudentSearchPage() throws Exception {
        mockMvc.perform(get("/student/search")
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(view().name("student-search"));
    }

    @Test
    void categoriesApiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void authenticatedAdminCanListCategories() throws Exception {
        mockMvc.perform(get("/api/categories")
                        .accept(MediaType.APPLICATION_JSON)
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void authenticatedAdminCanSearchStudentsViaApi() throws Exception {
        mockMvc.perform(get("/api/student-admissions")
                        .accept(MediaType.APPLICATION_JSON)
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThan(0)));
    }

    @Test
    void authenticatedAdminCanViewStudentProfilePage() throws Exception {
        mockMvc.perform(get("/student/view/1")
                        .with(user(TestAccounts.DEMO_ADMIN).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(view().name("student-view"));
    }
}
