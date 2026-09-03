package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "online_exam_students", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"online_exam_id", "student_admission_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineExamStudent extends BaseEntity {

    @Column(name = "online_exam_id", nullable = false)
    private Long onlineExamId;

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;
}
