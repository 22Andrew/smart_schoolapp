package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "cbse_exam_terms")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamTerm extends BaseEntity {

    @Column(name = "term_name", nullable = false, length = 200)
    private String termName;

    @Column(name = "term_code", nullable = false, unique = true, length = 50)
    private String termCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
