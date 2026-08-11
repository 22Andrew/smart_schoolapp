package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_group_exams")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "examGroup")
@ToString(exclude = "examGroup")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamGroupExam extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_group_id", nullable = false)
    private ExamGroup examGroup;
}
