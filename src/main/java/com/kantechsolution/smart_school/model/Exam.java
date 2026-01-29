package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Exam entity representing scheduled examinations
 */
@Entity
@Table(name = "exams")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"course"})
@ToString(exclude = {"course"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", length = 30)
    private ExamType examType;
    
    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;
    
    @Column(name = "start_time")
    private LocalTime startTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @Column(name = "total_marks", nullable = false)
    private Double totalMarks;
    
    @Column(name = "passing_marks")
    private Double passingMarks;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "room_number", length = 50)
    private String roomNumber;
    
    @Column(length = 500)
    private String instructions;
    
    public enum ExamType {
        UNIT_TEST,
        MID_TERM,
        FINAL_TERM,
        QUARTERLY,
        HALF_YEARLY,
        ANNUAL,
        ENTRANCE,
        OTHER
    }
}
