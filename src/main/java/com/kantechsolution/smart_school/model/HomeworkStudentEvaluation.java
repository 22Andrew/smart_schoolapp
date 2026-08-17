package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "homework_student_evaluations")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeworkStudentEvaluation extends BaseEntity {

    @Column(name = "homework_id", nullable = false)
    private Long homeworkId;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "student_name", nullable = false, length = 200)
    private String studentName;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "document_path", length = 500)
    private String documentPath;

    @Column(name = "document_name", length = 255)
    private String documentName;

    private Double marks;
}
