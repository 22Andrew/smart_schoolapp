package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cbse_observation_details")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "cbseObservation")
@ToString(exclude = "cbseObservation")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseObservationDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cbse_observation_id", nullable = false)
    private CbseObservation cbseObservation;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "parameter_id", nullable = false)
    private CbseObservationParameter parameter;

    @Column(name = "max_marks", nullable = false)
    private Integer maxMarks;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
