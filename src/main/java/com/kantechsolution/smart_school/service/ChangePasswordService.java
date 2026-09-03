package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.CompositeUserDetailsService;
import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ChangePasswordService {

    private final CompositeUserDetailsService compositeUserDetailsService;
    private final InMemoryUserDetailsManager adminUserDetailsManager;
    private final UserLoginAuthService userLoginAuthService;
    private final AppUserAccountRepository appUserAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(Authentication authentication,
                               String currentPassword,
                               String newPassword,
                               String confirmPassword) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("You must be logged in to change your password.");
        }

        if (!StringUtils.hasText(currentPassword)
                || !StringUtils.hasText(newPassword)
                || !StringUtils.hasText(confirmPassword)) {
            throw new IllegalArgumentException("All password fields are required.");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        String username = authentication.getName();
        UserDetails userDetails = compositeUserDetailsService.loadUserByUsername(username);

        if (!passwordEncoder.matches(currentPassword, userDetails.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(newPassword, userDetails.getPassword())) {
            throw new IllegalArgumentException("New password must be different from your current password.");
        }

        String encoded = passwordEncoder.encode(newPassword);

        var account = userLoginAuthService.findEnabledAccount(username);
        if (account.isPresent()) {
            AppUserAccount row = account.get();
            row.setPasswordHash(encoded);
            appUserAccountRepository.save(row);
            return;
        }

        UserDetails updated = User.withUsername(userDetails.getUsername())
                .password(encoded)
                .authorities(userDetails.getAuthorities())
                .disabled(!userDetails.isEnabled())
                .build();
        adminUserDetailsManager.updateUser(updated);
    }
}
