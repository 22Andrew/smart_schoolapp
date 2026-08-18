package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_cv_skills")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCvSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private StudentAdmission student;

    @Column(name = "skill_category", length = 150)
    private String skillCategory;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
