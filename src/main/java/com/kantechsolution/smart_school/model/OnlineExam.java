package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "online_exams")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineExam extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    @Builder.Default
    private Boolean quiz = false;

    @Column(name = "exam_from", nullable = false)
    private LocalDateTime examFrom;

    @Column(name = "exam_to", nullable = false)
    private LocalDateTime examTo;

    @Column(name = "auto_result_publish_date")
    private LocalDateTime autoResultPublishDate;

    @Column(name = "time_duration", nullable = false, length = 20)
    @Builder.Default
    private String timeDuration = "01:00:00";

    @Column(nullable = false)
    @Builder.Default
    private Integer attempt = 1;

    @Column(name = "passing_percentage", nullable = false)
    @Builder.Default
    private Double passingPercentage = 40.0;

    @Column(name = "answer_word_limit", nullable = false)
    @Builder.Default
    private Integer answerWordLimit = -1;

    @Column(name = "publish_exam", nullable = false)
    @Builder.Default
    private Boolean publishExam = false;

    @Column(name = "publish_result", nullable = false)
    @Builder.Default
    private Boolean publishResult = false;

    @Column(name = "negative_marking", nullable = false)
    @Builder.Default
    private Boolean negativeMarking = false;

    @Column(name = "display_marks_in_exam", nullable = false)
    @Builder.Default
    private Boolean displayMarksInExam = false;

    @Column(name = "random_question_order", nullable = false)
    @Builder.Default
    private Boolean randomQuestionOrder = false;

    @Column(columnDefinition = "TEXT")
    private String description;
}
