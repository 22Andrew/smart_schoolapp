package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_result_records")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"examGroupExam", "studentAdmission", "subjectMarks"})
@ToString(exclude = {"examGroupExam", "studentAdmission", "subjectMarks"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResultRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_group_exam_id", nullable = false)
    private ExamGroupExam examGroupExam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_admission_id", nullable = false)
    private StudentAdmission studentAdmission;

    @Column(name = "session_year", nullable = false, length = 20)
    private String sessionYear;

    @Column(name = "grand_total", precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @Column(precision = 6, scale = 2)
    private BigDecimal percent;

    @Column(name = "student_rank")
    private Integer studentRank;

    @Column(name = "result_status", length = 20)
    private String resultStatus;

    @OneToMany(mappedBy = "examResultRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamResultSubjectMark> subjectMarks = new ArrayList<>();
}
