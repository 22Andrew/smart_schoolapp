package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cbse_exam_ranks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cbse_exam_id", "student_admission_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = "cbseExam")
@ToString(exclude = "cbseExam")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamRank extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbse_exam_id", nullable = false)
    private CbseExam cbseExam;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "student_rank", nullable = false)
    private Integer studentRank;
}
