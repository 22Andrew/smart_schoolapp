package com.kantechsolution.smart_school.auth;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.service.StaffAuthorityResolver;
import com.kantechsolution.smart_school.service.UserLoginAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserLoginAuthServiceTest {

    @Mock
    private AppUserAccountRepository appUserAccountRepository;

    @Mock
    private StudentAdmissionRepository studentAdmissionRepository;

    @Mock
    private StaffMemberRepository staffMemberRepository;

    @Mock
    private StaffAuthorityResolver staffAuthorityResolver;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserLoginAuthService userLoginAuthService;

    @Test
    void findAccountReturnsEmptyForBlankUsername() {
        assertTrue(userLoginAuthService.findAccount("  ").isEmpty());
    }

    @Test
    void findAccountIgnoresDisabledLoginAccounts() {
        AppUserAccount disabled = AppUserAccount.builder()
                .username("std1")
                .userType(UserLoginAuthService.TYPE_STUDENT)
                .loginEnabled(false)
                .passwordHash("hash")
                .build();

        when(appUserAccountRepository.findByUsernameIgnoreCase("std1")).thenReturn(Optional.of(disabled));

        assertTrue(userLoginAuthService.findAccount("std1").isEmpty());
    }

    @Test
    void toUserDetailsBuildsStudentRole() {
        AppUserAccount account = AppUserAccount.builder()
                .username("std1")
                .userType(UserLoginAuthService.TYPE_STUDENT)
                .passwordHash("hash")
                .loginEnabled(true)
                .build();

        UserDetails userDetails = userLoginAuthService.toUserDetails(account);

        assertEquals("std1", userDetails.getUsername());
        assertFalse(userDetails.getAuthorities().isEmpty());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_STUDENT")));
    }
}
