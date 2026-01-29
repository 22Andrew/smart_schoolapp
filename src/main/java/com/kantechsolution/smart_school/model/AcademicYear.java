package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Academic Year entity representing school years
 */
@Entity
@Table(name = "academic_years")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicYear extends BaseEntity {
    
    @Column(nullable = false, unique = true, length = 50)
    private String year; // e.g., "2024-2025"
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;
    
    @Column(length = 500)
    private String description;
}
