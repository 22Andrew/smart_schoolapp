package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "lesson_plan_schedules")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlanSchedule extends BaseEntity {

    @Column(name = "teacher_code", nullable = false, length = 50)
    private String teacherCode;

    @Column(name = "teacher_name", nullable = false, length = 150)
    private String teacherName;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(name = "subject_code", length = 20)
    private String subjectCode;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(nullable = false, length = 20)
    private String section;

    @Column(name = "time_from", nullable = false)
    private LocalTime timeFrom;

    @Column(name = "time_to", nullable = false)
    private LocalTime timeTo;

    @Column(name = "room_no", length = 50)
    private String roomNo;
}
