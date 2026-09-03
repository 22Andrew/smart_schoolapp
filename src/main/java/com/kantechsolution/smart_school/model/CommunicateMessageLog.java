package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "communicate_message_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunicateMessageLog extends BaseEntity {

    @Column(name = "message_type", nullable = false, length = 10)
    private String messageType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "recipient_type", nullable = false, length = 50)
    private String recipientType;

    @Column(name = "recipient_details", columnDefinition = "TEXT")
    private String recipientDetails;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "compose_tab", length = 30)
    private String composeTab;

    @Column(name = "attachment_path", length = 500)
    private String attachmentPath;

    @Column(name = "email_template_id")
    private Long emailTemplateId;

    @Column(name = "sms_template_id")
    private Long smsTemplateId;

    @Column(name = "send_mode", length = 20)
    private String sendMode;
}
