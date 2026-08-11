package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cbse_observation_assigns")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"cbseObservation", "cbseExamTerm"})
@ToString(exclude = {"cbseObservation", "cbseExamTerm"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseObservationAssign extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cbse_observation_id", nullable = false)
    private CbseObservation cbseObservation;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cbse_exam_term_id", nullable = false)
    private CbseExamTerm cbseExamTerm;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;
}
