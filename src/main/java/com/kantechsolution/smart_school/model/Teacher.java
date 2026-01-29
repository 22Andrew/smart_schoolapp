package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Teacher entity representing teaching staff
 */
@Entity
@Table(name = "teachers")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"user", "subjects"})
@ToString(exclude = {"user", "subjects"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "employee_id", unique = true, length = 50)
    private String employeeId;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;
    
    @Column(name = "qualification", length = 200)
    private String qualification;
    
    @Column(name = "joining_date")
    private LocalDate joiningDate;
    
    @Column(name = "experience_years")
    private Integer experienceYears;
    
    @Column(length = 100)
    private String specialization;
    
    @Column(length = 500)
    private String address;
    
    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "teacher_subjects",
        joinColumns = @JoinColumn(name = "teacher_id"),
        inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    @Builder.Default
    private Set<Subject> subjects = new HashSet<>();
    
    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
}
