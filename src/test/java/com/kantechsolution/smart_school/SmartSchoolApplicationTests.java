package com.kantechsolution.smart_school;

import com.kantechsolution.smart_school.config.CompositeUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class SmartSchoolApplicationTests {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private CompositeUserDetailsService compositeUserDetailsService;

	@Test
	void contextLoads() {
	}

	@Test
	void studentDemoAccountAuthenticates() {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken("std1", "110001"));

		assertTrue(authentication.isAuthenticated());
		assertEquals("std1", authentication.getName());
		assertTrue(authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_STUDENT")));
	}

	@Test
	void parentDemoAccountAuthenticates() {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken("parent1", "110001"));

		assertTrue(authentication.isAuthenticated());
		assertEquals("parent1", authentication.getName());
		assertTrue(authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_PARENT")));
	}

	@Test
	void studentAccountIsLoadedFromDatabase() {
		assertNotNull(compositeUserDetailsService.loadUserByUsername("std1"));
		assertNotNull(compositeUserDetailsService.loadUserByUsername("parent1"));
	}

}
