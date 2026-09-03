package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "cbse_observation_parameters")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseObservationParameter extends BaseEntity {

    @Column(name = "parameter_name", nullable = false, unique = true, length = 200)
    private String parameterName;
}
