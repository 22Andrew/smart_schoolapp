package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "exam_result_subject_marks")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "examResultRecord")
@ToString(exclude = "examResultRecord")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResultSubjectMark extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_result_record_id", nullable = false)
    private ExamResultRecord examResultRecord;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(name = "subject_code", length = 20)
    private String subjectCode;

    @Column(name = "marks_obtained", precision = 8, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "marks_max", precision = 8, scale = 2)
    private BigDecimal marksMax;

    @Column(name = "is_absent")
    private Boolean absent;

    @Column(length = 500)
    private String note;
}
