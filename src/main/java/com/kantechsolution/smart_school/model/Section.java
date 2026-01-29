package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Section entity representing class sections (e.g., Section A, Section B)
 */
@Entity
@Table(name = "sections", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"grade_id", "name"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"grade", "students"})
@ToString(exclude = {"grade", "students"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Section extends BaseEntity {
    
    @Column(nullable = false, length = 50)
    private String name; // e.g., "A", "B", "C"
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id", nullable = false)
    private Grade grade;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_id")
    private Teacher classTeacher;
    
    @Column(name = "room_number", length = 20)
    private String roomNumber;
    
    @Column(name = "max_students")
    private Integer maxStudents;
    
    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Student> students = new HashSet<>();
}
