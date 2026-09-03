package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * ExamResult entity for storing student exam results
 */
@Entity
@Table(name = "exam_results", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"exam_id", "student_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"exam", "student"})
@ToString(exclude = {"exam", "student"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(name = "marks_obtained", nullable = false)
    private Double marksObtained;
    
    @Column(length = 10)
    private String grade;
    
    @Column(length = 1000)
    private String remarks;
    
    @Column(name = "is_absent")
    @Builder.Default
    private Boolean isAbsent = false;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ResultStatus status;
    
    public enum ResultStatus {
        PASS,
        FAIL,
        ABSENT,
        UNDER_REVIEW
    }
}
