package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_attendance_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_admission_id", "attendance_date"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAttendanceEntry extends BaseEntity {

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 50)
    @Builder.Default
    private String source = "Manual";

    @Column(name = "entry_time", length = 20)
    private String entryTime;

    @Column(name = "exit_time", length = 20)
    private String exitTime;

    @Column(length = 500)
    private String note;
}
