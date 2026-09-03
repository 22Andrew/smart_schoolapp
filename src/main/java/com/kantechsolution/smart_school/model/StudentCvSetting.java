package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "student_cv_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCvSetting extends BaseEntity {

    @Column(name = "enabled_student_fields", columnDefinition = "TEXT")
    private String enabledStudentFields;

    @Column(name = "work_experience_enabled", nullable = false)
    private boolean workExperienceEnabled = true;

    @Column(name = "education_enabled", nullable = false)
    private boolean educationEnabled = true;

    @Column(name = "skills_enabled", nullable = false)
    private boolean skillsEnabled = true;

    @Column(name = "references_enabled", nullable = false)
    private boolean referencesEnabled = true;

    @Column(name = "other_details_enabled", nullable = false)
    private boolean otherDetailsEnabled = true;

    @Column(name = "student_panel_download", nullable = false)
    private boolean studentPanelDownload = false;
}
