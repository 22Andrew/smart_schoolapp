package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Extra class/section assignment for multi-class students.
 */
@Entity
@Table(name = "student_class_assignments")
public class StudentClassAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "school_class_id", nullable = false)
    private SchoolClass schoolClass;

    @Column(name = "section_name", nullable = false, length = 20)
    private String section;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public StudentClassAssignment() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentAdmissionId() {
        return studentAdmissionId;
    }

    public void setStudentAdmissionId(Long studentAdmissionId) {
        this.studentAdmissionId = studentAdmissionId;
    }

    public SchoolClass getSchoolClass() {
        return schoolClass;
    }

    public void setSchoolClass(SchoolClass schoolClass) {
        this.schoolClass = schoolClass;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
