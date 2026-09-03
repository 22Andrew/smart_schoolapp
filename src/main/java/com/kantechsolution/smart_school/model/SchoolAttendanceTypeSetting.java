package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_attendance_type_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolAttendanceTypeSetting extends BaseEntity {

    @Column(name = "attendance_mode", nullable = false, length = 20)
    private String attendanceMode;

    @Column(name = "qr_barcode_biometric_enabled", nullable = false)
    private Boolean qrBarcodeBiometricEnabled;

    @Column(name = "devices", length = 500)
    private String devices;

    @Column(name = "low_attendance_limit")
    private Double lowAttendanceLimit;
}
