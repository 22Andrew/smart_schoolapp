package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "notice_boards")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeBoard extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "notice_date", nullable = false)
    private LocalDate noticeDate;

    @Column(name = "publish_on")
    private LocalDate publishOn;

    @Column(name = "publish_to", nullable = false, length = 50)
    private String publishTo;

    @Column(name = "message_to", columnDefinition = "TEXT")
    private String messageTo;

    @Column(name = "attachment_path", length = 500)
    private String attachmentPath;

    @Column(name = "send_by_email", nullable = false)
    private Boolean sendByEmail;

    @Column(name = "send_by_sms", nullable = false)
    private Boolean sendBySms;

    @Column(name = "show_on_website", nullable = false)
    private Boolean showOnWebsite;
}
