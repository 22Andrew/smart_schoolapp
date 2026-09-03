package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cbse_exam_assessment_details")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "cbseExamAssessment")
@ToString(exclude = "cbseExamAssessment")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamAssessmentDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbse_exam_assessment_id", nullable = false)
    private CbseExamAssessment cbseExamAssessment;

    @Column(name = "assessment_type", nullable = false, length = 150)
    private String assessmentType;

    @Column(length = 50)
    private String code;

    @Column(name = "maximum_marks", nullable = false)
    private Integer maximumMarks;

    @Column(name = "pass_percentage", nullable = false)
    private Integer passPercentage;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
