package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "cbse_exam_subjects")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "cbseExam")
@ToString(exclude = "cbseExam")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamSubject extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbse_exam_id", nullable = false)
    private CbseExam cbseExam;

    @Column(name = "subject_name", nullable = false, length = 200)
    private String subjectName;

    @Column(nullable = false, length = 500)
    private String assessments;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "room_no", length = 50)
    private String roomNo;
}
