package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_id_auto_generation_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolIdAutoGenerationSetting extends BaseEntity {

    @Column(name = "auto_admission_no", nullable = false)
    private Boolean autoAdmissionNo;

    @Column(name = "admission_no_prefix", length = 50)
    private String admissionNoPrefix;

    @Column(name = "admission_no_digit")
    private Integer admissionNoDigit;

    @Column(name = "admission_start_from", length = 50)
    private String admissionStartFrom;

    @Column(name = "auto_staff_id", nullable = false)
    private Boolean autoStaffId;

    @Column(name = "staff_id_prefix", length = 50)
    private String staffIdPrefix;

    @Column(name = "staff_no_digit")
    private Integer staffNoDigit;

    @Column(name = "staff_id_start_from", length = 50)
    private String staffIdStartFrom;
}
