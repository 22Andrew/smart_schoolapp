package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "cbse_exam_categories")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExamCategory extends BaseEntity {

    @Column(name = "category_name", nullable = false, unique = true, length = 200)
    private String categoryName;
}
