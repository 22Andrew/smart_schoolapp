package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cbse_observations")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "details")
@ToString(exclude = "details")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseObservation extends BaseEntity {

    @Column(name = "observation_name", nullable = false, length = 200)
    private String observationName;

    @Column(name = "observation_description", columnDefinition = "TEXT")
    private String observationDescription;

    @OneToMany(mappedBy = "cbseObservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @Builder.Default
    private List<CbseObservationDetail> details = new ArrayList<>();
}
