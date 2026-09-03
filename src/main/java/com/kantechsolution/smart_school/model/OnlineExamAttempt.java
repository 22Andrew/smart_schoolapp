package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "online_exam_attempts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineExamAttempt extends BaseEntity {

    @Column(name = "online_exam_id", nullable = false)
    private Long onlineExamId;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "attempt_number", nullable = false)
    @Builder.Default
    private Integer attemptNumber = 1;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean submitted = false;

    @Column(name = "remaining_seconds")
    private Integer remainingSeconds;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;
}
