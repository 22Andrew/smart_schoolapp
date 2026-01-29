package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Course entity representing specific course offerings
 */
@Entity
@Table(name = "courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"subject_id", "section_id", "academic_year_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"subject", "section", "teacher", "academicYear"})
@ToString(exclude = {"subject", "section", "teacher", "academicYear"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;
    
    @Column(name = "course_code", unique = true, length = 50)
    private String courseCode;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "total_classes")
    private Integer totalClasses;
    
    @Column(name = "classes_held")
    @Builder.Default
    private Integer classesHeld = 0;
}
