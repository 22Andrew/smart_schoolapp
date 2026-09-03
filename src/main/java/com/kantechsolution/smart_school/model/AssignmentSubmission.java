package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * AssignmentSubmission entity for student assignment submissions
 */
@Entity
@Table(name = "assignment_submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"assignment_id", "student_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"assignment", "student"})
@ToString(exclude = {"assignment", "student"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;
    
    @Column(length = 2000)
    private String content;
    
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;
    
    @Column(name = "marks_obtained")
    private Double marksObtained;
    
    @Column(length = 1000)
    private String feedback;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private Teacher gradedBy;
    
    @Column(name = "graded_date")
    private LocalDateTime gradedDate;
    
    public enum SubmissionStatus {
        SUBMITTED,
        LATE_SUBMISSION,
        GRADED,
        RETURNED,
        RESUBMISSION_REQUIRED
    }
}
