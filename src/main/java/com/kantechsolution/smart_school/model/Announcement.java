package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Announcement entity for school announcements and notices
 */
@Entity
@Table(name = "announcements")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"createdBy"})
@ToString(exclude = {"createdBy"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement extends BaseEntity {
    
    @Column(nullable = false, length = 300)
    private String title;
    
    @Column(nullable = false, length = 5000)
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "announcement_type", length = 30)
    private AnnouncementType announcementType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", length = 20)
    private TargetAudience targetAudience;
    
    @Column(name = "publish_date", nullable = false)
    private LocalDateTime publishDate;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;
    
    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;
    
    public enum AnnouncementType {
        GENERAL,
        ACADEMIC,
        EVENT,
        HOLIDAY,
        EXAMINATION,
        EMERGENCY,
        SPORTS,
        CULTURAL
    }
    
    public enum Priority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    public enum TargetAudience {
        ALL,
        STUDENTS,
        TEACHERS,
        PARENTS,
        STAFF,
        SPECIFIC_GRADE
    }
}
