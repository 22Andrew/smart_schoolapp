package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cbse_exam_grade_details")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "cbseExamGrade")
@ToString(exclude = "cbseExamGrade")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamGradeDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbse_exam_grade_id", nullable = false)
    private CbseExamGrade cbseExamGrade;

    @Column(name = "grade_name", nullable = false, length = 20)
    private String gradeName;

    @Column(name = "max_percentage", nullable = false)
    private Integer maxPercentage;

    @Column(name = "min_percentage", nullable = false)
    private Integer minPercentage;

    @Column(length = 200)
    private String remark;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
