package com.kantechsolution.smart_school.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/", "/home", "/css/**", "/js/**", "/images/**", "/uploads/**",
                               "/about", "/features", "/contact", "/register").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/perform-login")
                .defaultSuccessUrl("/dashboard", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            );

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails superAdmin = User.builder()
            .username("superadmin@gmail.com")
            .password(passwordEncoder().encode("Superadmin1"))
            .roles("SUPER_ADMIN")
            .build();

        UserDetails admin = User.builder()
            .username("admin@gmail.com")
            .password(passwordEncoder().encode("Admin123"))
            .roles("ADMIN")
            .build();

        UserDetails teacher = User.builder()
            .username("teacher@gmail.com")
            .password(passwordEncoder().encode("Teacher123"))
            .roles("TEACHER")
            .build();

        UserDetails accountant = User.builder()
            .username("accountant@gmail.com")
            .password(passwordEncoder().encode("Accountant123"))
            .roles("ACCOUNTANT")
            .build();

        UserDetails receptionist = User.builder()
            .username("receptionist@gmail.com")
            .password(passwordEncoder().encode("Receptionist123"))
            .roles("RECEPTIONIST")
            .build();

        UserDetails librarian = User.builder()
            .username("librarian@gmail.com")
            .password(passwordEncoder().encode("Librarian123"))
            .roles("LIBRARIAN")
            .build();

        return new InMemoryUserDetailsManager(superAdmin, admin, teacher, accountant, receptionist, librarian);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
