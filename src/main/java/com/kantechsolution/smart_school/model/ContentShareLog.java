package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "content_share_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentShareLog extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "share_date", nullable = false)
    private LocalDate shareDate;

    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "send_to_type", nullable = false, length = 50)
    private String sendToType;

    @Column(name = "send_to_details", columnDefinition = "TEXT")
    private String sendToDetails;

    @Column(name = "recipient_roles", columnDefinition = "TEXT")
    private String recipientRoles;

    @Column(name = "content_ids", nullable = false, columnDefinition = "TEXT")
    private String contentIds;

    @Column(name = "content_titles", columnDefinition = "TEXT")
    private String contentTitles;

    @Column(name = "shared_by", length = 120)
    private String sharedBy;
}
