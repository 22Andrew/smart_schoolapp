package com.kantechsolution.smart_school.auth;

import com.kantechsolution.smart_school.config.CompositeUserDetailsService;
import com.kantechsolution.smart_school.support.AbstractIntegrationTest;
import com.kantechsolution.smart_school.support.TestAccounts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class AuthIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CompositeUserDetailsService compositeUserDetailsService;

    @Test
    void adminLoginPageIsAccessible() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void userLoginPageIsAccessible() throws Exception {
        mockMvc.perform(get("/site/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("site-login"));
    }

    @Test
    void studentDemoAccountAuthenticates() {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        TestAccounts.DEMO_STUDENT,
                        TestAccounts.DEMO_STUDENT_PASSWORD));

        assertTrue(authentication.isAuthenticated());
        assertEquals(TestAccounts.DEMO_STUDENT, authentication.getName());
        assertTrue(authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }

    @Test
    void parentDemoAccountAuthenticates() {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        TestAccounts.DEMO_PARENT,
                        TestAccounts.DEMO_STUDENT_PASSWORD));

        assertTrue(authentication.isAuthenticated());
        assertEquals(TestAccounts.DEMO_PARENT, authentication.getName());
        assertTrue(authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_PARENT")));
    }

    @Test
    void adminDemoAccountAuthenticates() {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        TestAccounts.DEMO_ADMIN,
                        TestAccounts.DEMO_ADMIN_PASSWORD));

        assertTrue(authentication.isAuthenticated());
        assertEquals(TestAccounts.DEMO_ADMIN, authentication.getName());
        assertTrue(authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    @Test
    void invalidCredentialsAreRejected() {
        assertThrows(BadCredentialsException.class, () -> authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("invalid-user", "wrong-password")));
    }

    @Test
    void demoAccountsAreLoadedFromDatabase() {
        assertNotNull(compositeUserDetailsService.loadUserByUsername(TestAccounts.DEMO_STUDENT));
        assertNotNull(compositeUserDetailsService.loadUserByUsername(TestAccounts.DEMO_PARENT));
        assertNotNull(compositeUserDetailsService.loadUserByUsername(TestAccounts.DEMO_ADMIN));
    }
}
