package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "homeworks")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Homework extends BaseEntity {

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

    @Column(name = "homework_date", nullable = false)
    private LocalDate homeworkDate;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;

    @Column(name = "max_marks")
    private Integer maxMarks;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "document_path", length = 500)
    private String documentPath;

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Column(name = "created_by", length = 150)
    private String createdBy;

    @Column(name = "evaluated_by", length = 150)
    private String evaluatedBy;
}
