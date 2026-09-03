package com.kantechsolution.smart_school.config;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.service.UserLoginAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Primary
@RequiredArgsConstructor
public class CompositeUserDetailsService implements UserDetailsService {

    private final UserLoginAuthService userLoginAuthService;
    private final InMemoryUserDetailsManager adminUserDetailsManager;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userLoginAuthService.findEnabledAccount(username)
                .map(this::toPanelUserDetails)
                .orElseGet(() -> adminUserDetailsManager.loadUserByUsername(username));
    }

    private UserDetails toPanelUserDetails(AppUserAccount account) {
        return User.builder()
                .username(account.getUsername())
                .password(account.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(userLoginAuthService.roleAuthority(account.getUserType()))))
                .disabled(Boolean.FALSE.equals(account.getLoginEnabled()))
                .build();
    }
}
