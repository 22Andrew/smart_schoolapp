package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Links a student admission to a sibling student admission.
 */
@Entity
@Table(
        name = "student_siblings",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_student_sibling_pair",
                columnNames = {"student_admission_id", "sibling_admission_id"}
        )
)
public class StudentSibling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_admission_id")
    private Long studentAdmissionId;

    @Column(name = "sibling_admission_id", nullable = false)
    private Long siblingAdmissionId;

    @Column(name = "draft_token", length = 64)
    private String draftToken;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

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

    public Long getSiblingAdmissionId() {
        return siblingAdmissionId;
    }

    public void setSiblingAdmissionId(Long siblingAdmissionId) {
        this.siblingAdmissionId = siblingAdmissionId;
    }

    public String getDraftToken() {
        return draftToken;
    }

    public void setDraftToken(String draftToken) {
        this.draftToken = draftToken;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
