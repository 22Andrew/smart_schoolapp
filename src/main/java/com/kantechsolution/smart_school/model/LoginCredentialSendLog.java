package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_credential_send_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginCredentialSendLog extends BaseEntity {

    @Column(name = "user_type", nullable = false, length = 30)
    private String userType;

    @Column(name = "send_via", nullable = false, length = 20)
    private String sendVia;

    @Column(name = "recipient_type", nullable = false, length = 50)
    private String recipientType;

    @Column(name = "recipient_details", columnDefinition = "TEXT")
    private String recipientDetails;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
