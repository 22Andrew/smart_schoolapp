package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Assignment entity for course assignments
 */
@Entity
@Table(name = "assignments")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"course"})
@ToString(exclude = {"course"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "total_marks")
    private Double totalMarks;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AssignmentType assignmentType;
    
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;
    
    public enum AssignmentType {
        HOMEWORK,
        PROJECT,
        CLASSWORK,
        QUIZ,
        OTHER
    }
}
