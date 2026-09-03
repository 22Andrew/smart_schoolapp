package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "behaviour_settings")
public class BehaviourSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_comment_enabled", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean studentCommentEnabled = true;

    @Column(name = "parent_comment_enabled", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean parentCommentEnabled = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isStudentCommentEnabled() {
        return studentCommentEnabled;
    }

    public void setStudentCommentEnabled(boolean studentCommentEnabled) {
        this.studentCommentEnabled = studentCommentEnabled;
    }

    public boolean isParentCommentEnabled() {
        return parentCommentEnabled;
    }

    public void setParentCommentEnabled(boolean parentCommentEnabled) {
        this.parentCommentEnabled = parentCommentEnabled;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
