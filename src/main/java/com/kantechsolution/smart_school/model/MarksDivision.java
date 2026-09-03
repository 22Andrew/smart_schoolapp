package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "marks_divisions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksDivision extends BaseEntity {

    @Column(name = "division_name", nullable = false, length = 100)
    private String divisionName;

    @Column(name = "percent_from", nullable = false)
    private Double percentFrom;

    @Column(name = "percent_upto", nullable = false)
    private Double percentUpto;
}
