package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "alumni_events")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniEvent extends BaseEntity {

    @Column(name = "event_for", nullable = false, length = 20)
    private String eventFor;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(name = "section_name", length = 20)
    private String sectionName;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "session_name", length = 20)
    private String sessionName;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String note;

    @Lob
    @Column(name = "notification_message", columnDefinition = "TEXT")
    private String notificationMessage;

    @Column(name = "notify_email")
    private Boolean notifyEmail;

    @Column(name = "notify_sms")
    private Boolean notifySms;

    @Column(name = "sms_template_id", length = 100)
    private String smsTemplateId;
}
