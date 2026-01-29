package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Parent entity representing student guardians
 */
@Entity
@Table(name = "parents")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"user", "children"})
@ToString(exclude = {"user", "children"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parent extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Relationship relationship;
    
    @Column(length = 100)
    private String occupation;
    
    @Column(name = "office_address", length = 500)
    private String officeAddress;
    
    @Column(name = "annual_income")
    private Double annualIncome;
    
    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "parent_students",
        joinColumns = @JoinColumn(name = "parent_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @Builder.Default
    private Set<Student> children = new HashSet<>();
    
    public enum Relationship {
        FATHER,
        MOTHER,
        GUARDIAN,
        OTHER
    }
}
