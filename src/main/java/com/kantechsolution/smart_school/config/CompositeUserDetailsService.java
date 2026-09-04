package com.kantechsolution.smart_school.config;

import com.kantechsolution.smart_school.service.UserLoginAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Primary
@RequiredArgsConstructor
public class CompositeUserDetailsService implements UserDetailsService {

    private final UserLoginAuthService userLoginAuthService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userLoginAuthService.findAccount(username)
                .map(userLoginAuthService::toUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
