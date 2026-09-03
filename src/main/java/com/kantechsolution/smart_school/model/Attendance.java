package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Attendance entity for tracking student attendance
 */
@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "date"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"student"})
@ToString(exclude = {"student"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;
    
    @Column(length = 500)
    private String remarks;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by")
    private Teacher markedBy;
    
    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE,
        EXCUSED,
        SICK_LEAVE,
        HALF_DAY
    }
}
