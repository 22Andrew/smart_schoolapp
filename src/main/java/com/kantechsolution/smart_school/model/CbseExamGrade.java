package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cbse_exam_grades")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "details")
@ToString(exclude = "details")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamGrade extends BaseEntity {

    @Column(name = "grade_title", nullable = false, length = 200)
    private String gradeTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "cbseExamGrade", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @Builder.Default
    private List<CbseExamGradeDetail> details = new ArrayList<>();
}
