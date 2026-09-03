package com.kantechsolution.smart_school.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(CompositeUserDetailsService compositeUserDetailsService,
                                                                 PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(compositeUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider daoAuthenticationProvider) {
        return new ProviderManager(daoAuthenticationProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationManager authenticationManager,
                                                   LoginSuccessHandler loginSuccessHandler,
                                                   LoginFailureHandler loginFailureHandler,
                                                   AppLogoutSuccessHandler logoutSuccessHandler) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/site/login", "/site/logout", "/user-login").permitAll()
                .requestMatchers("/user/**").hasAnyRole("STUDENT", "PARENT")
                .requestMatchers("/", "/home", "/login", "/perform-login", "/logout", "/css/**", "/js/**",
                        "/images/**", "/uploads/**", "/about", "/features", "/contact", "/register").permitAll()
                .requestMatchers("/api/schsettings/branding").permitAll()
                .requestMatchers("/api/schsettings/login-background").permitAll()
                .requestMatchers("/api/schsettings/backend-theme").permitAll()
                .requestMatchers("/api/currencies/active").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/languages/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new LoginUrlAuthenticationEntryPoint("/site/login"),
                    PathPatternRequestMatcher.withDefaults().matcher("/user/**")))
            .authenticationManager(authenticationManager)
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/perform-login")
                .successHandler(loginSuccessHandler)
                .failureHandler(loginFailureHandler)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new OrRequestMatcher(
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/logout"),
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/site/logout")))
                .logoutSuccessHandler(logoutSuccessHandler)
                .permitAll()
            )
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
                "/css/**",
                "/js/**",
                "/images/**",
                "/webjars/**",
                "/favicon.ico"
        );
    }

    @Bean
    public InMemoryUserDetailsManager adminUserDetailsManager(PasswordEncoder passwordEncoder) {
        UserDetails superAdmin = User.builder()
            .username("superadmin@gmail.com")
            .password(passwordEncoder.encode("Superadmin1"))
            .roles("SUPER_ADMIN")
            .build();

        UserDetails admin = User.builder()
            .username("admin@gmail.com")
            .password(passwordEncoder.encode("Admin123"))
            .roles("ADMIN")
            .build();

        UserDetails teacher = User.builder()
            .username("teacher@gmail.com")
            .password(passwordEncoder.encode("Teacher123"))
            .roles("TEACHER")
            .build();

        UserDetails accountant = User.builder()
            .username("accountant@gmail.com")
            .password(passwordEncoder.encode("Accountant123"))
            .roles("ACCOUNTANT")
            .build();

        UserDetails receptionist = User.builder()
            .username("receptionist@gmail.com")
            .password(passwordEncoder.encode("Receptionist123"))
            .roles("RECEPTIONIST")
            .build();

        UserDetails librarian = User.builder()
            .username("librarian@gmail.com")
            .password(passwordEncoder.encode("Librarian123"))
            .roles("LIBRARIAN")
            .build();

        return new InMemoryUserDetailsManager(superAdmin, admin, teacher, accountant, receptionist, librarian);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
