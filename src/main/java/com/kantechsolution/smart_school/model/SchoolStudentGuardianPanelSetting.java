package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_student_guardian_panel_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolStudentGuardianPanelSetting extends BaseEntity {

    @Column(name = "student_login_enabled", nullable = false)
    private Boolean studentLoginEnabled;

    @Column(name = "parent_login_enabled", nullable = false)
    private Boolean parentLoginEnabled;

    @Column(name = "student_login_admission_no", nullable = false)
    private Boolean studentLoginAdmissionNo;

    @Column(name = "student_login_mobile_number", nullable = false)
    private Boolean studentLoginMobileNumber;

    @Column(name = "student_login_email", nullable = false)
    private Boolean studentLoginEmail;

    @Column(name = "parent_login_mobile_number", nullable = false)
    private Boolean parentLoginMobileNumber;

    @Column(name = "parent_login_email", nullable = false)
    private Boolean parentLoginEmail;

    @Column(name = "allow_student_add_timeline", nullable = false)
    private Boolean allowStudentAddTimeline;
}
