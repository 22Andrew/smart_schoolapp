package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Links a student admission to a fees group for a session.
 */
@Entity
@Table(name = "fee_group_assignments", uniqueConstraints = {
        @UniqueConstraint(name = "uk_fee_group_student_session",
                columnNames = {"fee_group_id", "student_admission_id", "session_year"})
})
public class FeeGroupAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fee_group_id", nullable = false)
    private Long feeGroupId;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "session_year", nullable = false, length = 20)
    private String sessionYear;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public FeeGroupAssignment() {}

    public FeeGroupAssignment(Long feeGroupId, Long studentAdmissionId, String sessionYear) {
        this.feeGroupId = feeGroupId;
        this.studentAdmissionId = studentAdmissionId;
        this.sessionYear = sessionYear;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFeeGroupId() {
        return feeGroupId;
    }

    public void setFeeGroupId(Long feeGroupId) {
        this.feeGroupId = feeGroupId;
    }

    public Long getStudentAdmissionId() {
        return studentAdmissionId;
    }

    public void setStudentAdmissionId(Long studentAdmissionId) {
        this.studentAdmissionId = studentAdmissionId;
    }

    public String getSessionYear() {
        return sessionYear;
    }

    public void setSessionYear(String sessionYear) {
        this.sessionYear = sessionYear;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
