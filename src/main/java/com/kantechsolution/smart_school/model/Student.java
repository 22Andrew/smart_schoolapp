package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Student entity representing enrolled students
 */
@Entity
@Table(name = "students")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"user", "section", "parents"})
@ToString(exclude = {"user", "section", "parents"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "admission_number", unique = true, nullable = false, length = 50)
    private String admissionNumber;
    
    @Column(name = "roll_number", length = 20)
    private String rollNumber;
    
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;
    
    @Column(name = "blood_group", length = 10)
    private String bloodGroup;
    
    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;
    
    @Column(length = 500)
    private String address;
    
    @Column(name = "previous_school", length = 200)
    private String previousSchool;
    
    @Column(name = "medical_conditions", length = 500)
    private String medicalConditions;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status", length = 20)
    @Builder.Default
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.ACTIVE;
    
    @ManyToMany(mappedBy = "children", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Parent> parents = new HashSet<>();
    
    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
    
    public enum EnrollmentStatus {
        ACTIVE,
        INACTIVE,
        GRADUATED,
        TRANSFERRED,
        WITHDRAWN
    }
}
