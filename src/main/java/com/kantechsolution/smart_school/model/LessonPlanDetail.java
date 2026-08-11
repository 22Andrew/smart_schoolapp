package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson_plan_details")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlanDetail extends BaseEntity {

    @Column(name = "schedule_id", nullable = false, unique = true)
    private Long scheduleId;

    @Column(name = "lesson_name", length = 200)
    private String lessonName;

    @Column(name = "topic_name", length = 200)
    private String topicName;

    @Column(name = "sub_topic", length = 500)
    private String subTopic;

    @Column(name = "general_objectives", columnDefinition = "TEXT")
    private String generalObjectives;

    @Column(name = "teaching_method", columnDefinition = "TEXT")
    private String teachingMethod;

    @Column(name = "previous_knowledge", columnDefinition = "TEXT")
    private String previousKnowledge;

    @Column(name = "comprehensive_questions", columnDefinition = "TEXT")
    private String comprehensiveQuestions;

    @Column(columnDefinition = "TEXT")
    private String presentation;
}
