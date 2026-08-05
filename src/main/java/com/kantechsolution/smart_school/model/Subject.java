package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Subject entity representing academic subjects
 */
@Entity
@Table(name = "subjects")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject extends BaseEntity {
    
    @Column(nullable = false, unique = true, length = 100)
    private String name; // e.g., "Mathematics", "English"
    
    @Column(name = "subject_code", unique = true, length = 20)
    private String subjectCode; // e.g., "MATH101"
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "credit_hours")
    private Integer creditHours;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", length = 20)
    private SubjectType subjectType;
    
    public enum SubjectType {
        THEORY,
        PRACTICAL
    }
}
