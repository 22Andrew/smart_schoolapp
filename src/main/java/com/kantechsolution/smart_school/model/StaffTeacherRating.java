package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "staff_teacher_ratings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffTeacherRating extends BaseEntity {

    @Column(name = "staff_member_id", nullable = false)
    private Long staffMemberId;

    @Column(name = "staff_id_code", nullable = false, length = 50)
    private String staffIdCode;

    @Column(name = "staff_name", nullable = false, length = 200)
    private String staffName;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 2000)
    private String comment;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(name = "student_name", nullable = false, length = 200)
    private String studentName;

    @Column(name = "student_admission_no", length = 50)
    private String studentAdmissionNo;
}
