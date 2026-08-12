package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "staff_attendance_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"staff_member_id", "attendance_date"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAttendanceEntry extends BaseEntity {

    @Column(name = "staff_member_id", nullable = false)
    private Long staffMemberId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(length = 50)
    @Builder.Default
    private String source = "N/A";

    @Column(name = "entry_time", length = 20)
    private String entryTime;

    @Column(name = "exit_time", length = 20)
    private String exitTime;

    @Column(length = 500)
    private String note;
}
