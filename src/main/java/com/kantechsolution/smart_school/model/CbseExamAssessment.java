package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cbse_exam_assessments")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "details")
@ToString(exclude = "details")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamAssessment extends BaseEntity {

    @Column(name = "assessment_name", nullable = false, length = 200)
    private String assessmentName;

    @Column(name = "assessment_description", columnDefinition = "TEXT")
    private String assessmentDescription;

    @OneToMany(mappedBy = "cbseExamAssessment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @Builder.Default
    private List<CbseExamAssessmentDetail> details = new ArrayList<>();
}
