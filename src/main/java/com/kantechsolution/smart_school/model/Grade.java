package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Grade/Class entity representing grade levels (e.g., Grade 1, Grade 2, etc.)
 */
@Entity
@Table(name = "grades")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"sections"})
@ToString(exclude = {"sections"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade extends BaseEntity {
    
    @Column(nullable = false, unique = true, length = 50)
    private String name; // e.g., "Grade 1", "Grade 2"
    
    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel; // Numeric representation: 1, 2, 3, etc.
    
    @Column(length = 500)
    private String description;
    
    @OneToMany(mappedBy = "grade", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Section> sections = new HashSet<>();
}
