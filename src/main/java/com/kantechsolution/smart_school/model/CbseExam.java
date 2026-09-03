package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cbse_exams")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"subjects", "students", "ranks"})
@ToString(exclude = {"subjects", "students", "ranks"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CbseExam extends BaseEntity {

    @Column(name = "exam_name", nullable = false, length = 300)
    private String examName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;

    @Column(name = "publish_result", nullable = false)
    @Builder.Default
    private boolean publishResult = false;

    @Column(nullable = false, length = 100)
    private String term;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(nullable = false, length = 100)
    private String sections;

    @Column(nullable = false, length = 100)
    private String assessment;

    @Column(nullable = false, length = 100)
    private String grade;

    @Column(name = "category_name", nullable = false, length = 100)
    private String categoryName;

    @Column(name = "admit_card_roll_type", length = 30)
    @Builder.Default
    private String admitCardRollType = "PROFILE";

    @Column(name = "mail_template", length = 150)
    private String mailTemplate;

    @Column(name = "rank_generated", nullable = false)
    @Builder.Default
    private boolean rankGenerated = false;

    @OneToMany(mappedBy = "cbseExam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CbseExamSubject> subjects = new ArrayList<>();

    @OneToMany(mappedBy = "cbseExam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CbseExamStudent> students = new ArrayList<>();

    @OneToMany(mappedBy = "cbseExam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CbseExamRank> ranks = new ArrayList<>();
}
