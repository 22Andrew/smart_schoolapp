package com.kantechsolution.smart_school.forgotpassword;

import com.kantechsolution.smart_school.config.CompositeUserDetailsService;
import com.kantechsolution.smart_school.model.PasswordResetToken;
import com.kantechsolution.smart_school.repository.AppUserAccountRepository;
import com.kantechsolution.smart_school.repository.NotificationSettingRepository;
import com.kantechsolution.smart_school.repository.PasswordResetTokenRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.service.ForgotPasswordService;
import com.kantechsolution.smart_school.service.SchoolGeneralSettingService;
import com.kantechsolution.smart_school.service.SystemMailService;
import com.kantechsolution.smart_school.service.UserLoginAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForgotPasswordServiceTest {

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private StudentAdmissionRepository studentAdmissionRepository;

    @Mock
    private AppUserAccountRepository appUserAccountRepository;

    @Mock
    private StaffMemberRepository staffMemberRepository;

    @Mock
    private NotificationSettingRepository notificationSettingRepository;

    @Mock
    private SchoolGeneralSettingService schoolGeneralSettingService;

    @Mock
    private CompositeUserDetailsService compositeUserDetailsService;

    @Mock
    private UserLoginAuthService userLoginAuthService;

    @Mock
    private SystemMailService systemMailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private ForgotPasswordService forgotPasswordService;

    @Test
    void requestPasswordResetRequiresEmail() {
        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> forgotPasswordService.requestPasswordReset("  ", request));

        assertEquals("Email is required.", error.getMessage());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void requestPasswordResetSilentlyIgnoresUnknownEmail() {
        when(compositeUserDetailsService.loadUserByUsername("unknown@example.com"))
                .thenThrow(new UsernameNotFoundException("not found"));
        when(staffMemberRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());
        when(appUserAccountRepository.findByUsernameIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());
        when(studentAdmissionRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(List.of());
        when(studentAdmissionRepository.findByGuardianEmailIgnoreCase("unknown@example.com")).thenReturn(List.of());

        forgotPasswordService.requestPasswordReset("unknown@example.com", request);

        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void findValidTokenReturnsEmptyForBlankToken() {
        assertTrue(forgotPasswordService.findValidToken("  ").isEmpty());
        verify(passwordResetTokenRepository, never()).findByToken(anyString());
    }

    @Test
    void findValidTokenRejectsExpiredToken() {
        PasswordResetToken token = PasswordResetToken.builder()
                .token("abc123")
                .email("user@example.com")
                .username("user@example.com")
                .accountType(ForgotPasswordService.TYPE_STAFF)
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(passwordResetTokenRepository.findByToken("abc123")).thenReturn(Optional.of(token));

        assertTrue(forgotPasswordService.findValidToken("abc123").isEmpty());
    }

    @Test
    void resetPasswordRequiresMatchingPasswords() {
        PasswordResetToken token = validToken("reset-token");
        when(passwordResetTokenRepository.findByToken("reset-token")).thenReturn(Optional.of(token));

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> forgotPasswordService.resetPassword("reset-token", "secret123", "different"));

        assertEquals("Password and confirm password do not match.", error.getMessage());
    }

    @Test
    void resetPasswordRequiresMinimumLength() {
        PasswordResetToken token = validToken("reset-token");
        when(passwordResetTokenRepository.findByToken("reset-token")).thenReturn(Optional.of(token));

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> forgotPasswordService.resetPassword("reset-token", "12345", "12345"));

        assertEquals("Password must be at least 6 characters.", error.getMessage());
    }

    @Test
    void resetPasswordRejectsInvalidToken() {
        when(passwordResetTokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> forgotPasswordService.resetPassword("missing", "secret123", "secret123"));

        assertEquals("This password reset link is invalid or has expired.", error.getMessage());
    }

    private PasswordResetToken validToken(String tokenValue) {
        return PasswordResetToken.builder()
                .token(tokenValue)
                .email("admin@gmail.com")
                .username("admin@gmail.com")
                .accountType(ForgotPasswordService.TYPE_STAFF)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
    }
}
