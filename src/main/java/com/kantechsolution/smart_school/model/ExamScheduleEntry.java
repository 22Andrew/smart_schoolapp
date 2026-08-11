package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "exam_schedule_entries")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "examGroupExam")
@ToString(exclude = "examGroupExam")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamScheduleEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_group_exam_id", nullable = false)
    private ExamGroupExam examGroupExam;

    @Column(name = "subject_name", nullable = false, length = 200)
    private String subjectName;

    @Column(name = "date_from")
    private LocalDate dateFrom;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "room_no", length = 50)
    private String roomNo;

    @Column(name = "marks_max", precision = 8, scale = 2)
    private BigDecimal marksMax;

    @Column(name = "marks_min", precision = 8, scale = 2)
    private BigDecimal marksMin;
}
