package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "online_exam_questions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"online_exam_id", "question_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineExamQuestion extends BaseEntity {

    @Column(name = "online_exam_id", nullable = false)
    private Long onlineExamId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(nullable = false)
    @Builder.Default
    private Double marks = 1.0;

    @Column(name = "negative_marks", nullable = false)
    @Builder.Default
    private Double negativeMarks = 0.25;

    @Column(name = "subject_name", length = 150)
    private String subjectName;
}
