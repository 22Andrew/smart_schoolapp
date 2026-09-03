package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_cv_references")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCvReference extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private StudentAdmission student;

    @Column(length = 150)
    private String name;

    @Column(length = 100)
    private String relation;

    @Column(length = 50)
    private String contact;

    @Column(length = 150)
    private String designation;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
