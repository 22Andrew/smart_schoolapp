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

    @Column(name = "session_year", length = 20)
    private String sessionYear;

    @Column(name = "publish_exam")
    private Boolean publishExam;

    @Column(name = "publish_result")
    private Boolean publishResult;

    @Column(name = "roll_type", length = 30)
    private String rollType;

    @Column(name = "marksheet_template_id")
    private Long marksheetTemplateId;

    @Column(length = 1000)
    private String description;

    @Column(name = "rank_generated")
    private Boolean rankGenerated;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_group_id", nullable = false)
    private ExamGroup examGroup;
}
