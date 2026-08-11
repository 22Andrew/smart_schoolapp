package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_groups")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "exams")
@ToString(exclude = "exams")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamGroup extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "exam_type", nullable = false, length = 100)
    private String examType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "examGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExamGroupExam> exams = new ArrayList<>();
}
