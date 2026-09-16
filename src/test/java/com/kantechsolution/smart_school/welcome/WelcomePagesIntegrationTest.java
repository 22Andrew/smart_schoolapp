package com.kantechsolution.smart_school.welcome;

import com.kantechsolution.smart_school.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class WelcomePagesIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void featuresPageIsPublic() throws Exception {
        mockMvc.perform(get("/features"))
                .andExpect(status().isOk())
                .andExpect(view().name("welcome-features"))
                .andExpect(content().string(containsString("Every feature in Smart School")))
                .andExpect(content().string(containsString("Front Office")));
    }

    @Test
    void howItWorksPageIsPublic() throws Exception {
        mockMvc.perform(get("/how-it-works"))
                .andExpect(status().isOk())
                .andExpect(view().name("welcome-how-it-works"))
                .andExpect(content().string(containsString("How Smart School works")));
    }

    @Test
    void helpPageIsPublic() throws Exception {
        mockMvc.perform(get("/help"))
                .andExpect(status().isOk())
                .andExpect(view().name("welcome-help"))
                .andExpect(content().string(containsString("Help &amp; Documentation")));
    }

    @Test
    void supportPageIsPublic() throws Exception {
        mockMvc.perform(get("/support"))
                .andExpect(status().isOk())
                .andExpect(view().name("welcome-support"))
                .andExpect(content().string(containsString("Support")));
    }
}
