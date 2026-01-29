package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Timetable entity for class schedules
 */
@Entity
@Table(name = "timetable", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"section_id", "day_of_week", "start_time"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"section", "course", "teacher"})
@ToString(exclude = {"section", "course", "teacher"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    
    @Column(name = "room_number", length = 50)
    private String roomNumber;
    
    @Column(name = "period_number")
    private Integer periodNumber;
    
    @Column(length = 500)
    private String notes;
}
