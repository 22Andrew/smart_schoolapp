package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_timelines")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentTimeline extends BaseEntity {

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "visible_to_student", nullable = false)
    @Builder.Default
    private Boolean visibleToStudent = true;

    @Column(name = "node_type", length = 20)
    @Builder.Default
    private String nodeType = "calendar";
}
