package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_attendance_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrAttendanceSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auto_attendance", nullable = false)
    private boolean autoAttendance = true;

    @Column(name = "sensor_device_enabled", nullable = false)
    private boolean sensorDeviceEnabled = true;

    @Column(name = "camera_device_enabled", nullable = false)
    private boolean cameraDeviceEnabled = true;

    @Column(name = "selected_camera", nullable = false, length = 20)
    private String selectedCamera = "primary";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
