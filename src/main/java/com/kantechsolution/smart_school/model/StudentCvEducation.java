package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_cv_educations")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCvEducation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private StudentAdmission student;

    @Column(length = 100)
    private String qualification;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(length = 20)
    private String year;

    @Column(length = 50)
    private String marks;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
