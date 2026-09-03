package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_class_attendance_times",
        uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "section"}))
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClassAttendanceTime extends BaseEntity {

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "section", nullable = false, length = 20)
    private String section;

    @Column(name = "submit_time", length = 10)
    private String submitTime;
}
