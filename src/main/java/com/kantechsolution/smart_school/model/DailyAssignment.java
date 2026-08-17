package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "daily_assignments")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyAssignment extends BaseEntity {

    @Column(name = "student_admission_id")
    private Long studentAdmissionId;

    @Column(name = "student_name", nullable = false, length = 200)
    private String studentName;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(nullable = false, length = 20)
    private String section;

    @Column(name = "subject_group_id")
    private Long subjectGroupId;

    @Column(name = "subject_group_name", nullable = false, length = 150)
    private String subjectGroupName;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "assignment_date", nullable = false)
    private LocalDate assignmentDate;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;

    @Column(name = "evaluated_by", length = 150)
    private String evaluatedBy;
}
