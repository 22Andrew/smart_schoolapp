package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "lesson_plan_syllabus_status")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlanSyllabusStatus extends BaseEntity {

    @Column(name = "topic_id", nullable = false, unique = true)
    private Long topicId;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(nullable = false)
    private Boolean completed = false;
}
