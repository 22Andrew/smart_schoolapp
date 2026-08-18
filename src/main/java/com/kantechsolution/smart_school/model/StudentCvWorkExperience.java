package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_cv_work_experiences")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCvWorkExperience extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private StudentAdmission student;

    @Column(length = 200)
    private String institution;

    @Column(length = 150)
    private String designation;

    @Column(length = 50)
    private String years;

    @Column(length = 150)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
