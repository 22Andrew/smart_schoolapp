package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "alumni_students")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alumni extends BaseEntity {

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "session_name", length = 20)
    private String sessionName;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(name = "section_name", length = 20)
    private String sectionName;

    @Column(name = "admission_number", nullable = false, length = 50)
    private String admissionNumber;

    @Column(name = "student_name", nullable = false, length = 200)
    private String studentName;

    @Column(length = 20)
    private String gender;

    @Column(name = "current_email", length = 150)
    private String currentEmail;

    @Column(name = "current_phone", length = 30)
    private String currentPhone;

    @Column(length = 150)
    private String occupation;

    @Column(length = 500)
    private String address;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;
}
