package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lesson_plan_lessons")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlanLesson extends BaseEntity {

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

    @Column(name = "subject_code", length = 20)
    private String subjectCode;

    @Column(name = "lesson_name", nullable = false, length = 200)
    private String lessonName;

    @Column(name = "academic_session", length = 20)
    private String academicSession;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    @Builder.Default
    private List<LessonPlanTopic> topics = new ArrayList<>();
}
