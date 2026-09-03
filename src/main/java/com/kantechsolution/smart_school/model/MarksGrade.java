package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "marks_grades")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksGrade extends BaseEntity {

    @Column(name = "exam_type", nullable = false, length = 200)
    private String examType;

    @Column(name = "grade_name", nullable = false, length = 50)
    private String gradeName;

    @Column(name = "percent_from", nullable = false)
    private Double percentFrom;

    @Column(name = "percent_upto", nullable = false)
    private Double percentUpto;

    @Column(name = "grade_point", nullable = false)
    private Double gradePoint;

    @Column(length = 500)
    private String description;
}
