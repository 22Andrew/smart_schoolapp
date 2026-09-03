package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSetting extends BaseEntity {

    @Column(name = "event_key", nullable = false, unique = true, length = 100)
    private String eventKey;

    @Column(name = "event_name", nullable = false, length = 255)
    private String eventName;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "notify_email", nullable = false)
    private Boolean notifyEmail;

    @Column(name = "notify_sms", nullable = false)
    private Boolean notifySms;

    @Column(name = "notify_mobile_app", nullable = false)
    private Boolean notifyMobileApp;

    @Column(name = "notify_whatsapp", nullable = false)
    private Boolean notifyWhatsapp;

    @Column(name = "recipient_student", nullable = false)
    private Boolean recipientStudent;

    @Column(name = "recipient_guardian", nullable = false)
    private Boolean recipientGuardian;

    @Column(name = "recipient_staff", nullable = false)
    private Boolean recipientStaff;

    @Column(name = "message_subject", length = 255)
    private String messageSubject;

    @Column(name = "sms_template_id", length = 100)
    private String smsTemplateId;

    @Column(name = "whatsapp_template_id", length = 100)
    private String whatsappTemplateId;

    @Column(name = "sample_message", columnDefinition = "TEXT")
    private String sampleMessage;
}
