package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_group_exam_students", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"exam_group_exam_id", "student_admission_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = "examGroupExam")
@ToString(exclude = "examGroupExam")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamGroupExamStudent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_group_exam_id", nullable = false)
    private ExamGroupExam examGroupExam;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(nullable = false)
    @Builder.Default
    private boolean assigned = true;
}
