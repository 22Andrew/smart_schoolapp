package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Event entity for school events and activities
 */
@Entity
@Table(name = "events")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"organizer"})
@ToString(exclude = {"organizer"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 30)
    private EventType eventType;
    
    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;
    
    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;
    
    @Column(length = 200)
    private String location;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Column(name = "registration_required")
    @Builder.Default
    private Boolean registrationRequired = false;
    
    @Column(name = "event_image_url", length = 500)
    private String eventImageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private EventStatus status = EventStatus.SCHEDULED;
    
    public enum EventType {
        ACADEMIC,
        SPORTS,
        CULTURAL,
        COMPETITION,
        WORKSHOP,
        SEMINAR,
        PARENT_TEACHER_MEETING,
        FIELD_TRIP,
        CELEBRATION,
        OTHER
    }
    
    public enum EventStatus {
        SCHEDULED,
        ONGOING,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }
}
