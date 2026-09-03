package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cbse_exam_student_marks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "cbse_exam_id", "student_admission_id", "subject_name", "assessment_label"
        })
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = "cbseExam")
@ToString(exclude = "cbseExam")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamStudentMark extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbse_exam_id", nullable = false)
    private CbseExam cbseExam;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "subject_name", nullable = false, length = 200)
    private String subjectName;

    @Column(name = "assessment_label", nullable = false, length = 120)
    private String assessmentLabel;

    @Column(name = "assessment_key", nullable = false, length = 40)
    private String assessmentKey;

    @Column(name = "max_marks", nullable = false)
    private Integer maxMarks;

    @Column(name = "marks_obtained", precision = 8, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "is_absent")
    @Builder.Default
    private Boolean absent = false;

    @Column(name = "assessment_order", nullable = false)
    @Builder.Default
    private Integer assessmentOrder = 0;
}
