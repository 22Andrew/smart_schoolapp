package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "exam_group_linked_exams")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "examGroupExam")
@ToString(exclude = "examGroupExam")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamGroupLinkedExam extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_group_exam_id", nullable = false)
    private ExamGroupExam examGroupExam;

    @Column(precision = 10, scale = 2)
    private BigDecimal weightage;
}
