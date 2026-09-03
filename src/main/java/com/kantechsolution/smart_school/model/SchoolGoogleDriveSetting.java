package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_google_drive_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolGoogleDriveSetting extends BaseEntity {

    @Column(name = "client_id", nullable = false, length = 500)
    private String clientId;

    @Column(name = "api_key", nullable = false, length = 255)
    private String apiKey;

    @Column(name = "project_number_app_id", nullable = false, length = 100)
    private String projectNumberAppId;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @Column(name = "allow_student_upload", nullable = false)
    private Boolean allowStudentUpload;

    @Column(name = "allow_guardian_upload", nullable = false)
    private Boolean allowGuardianUpload;

    @Column(name = "allow_staff_upload", nullable = false)
    private Boolean allowStaffUpload;
}
