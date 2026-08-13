package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_attendance_rules",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_attendance_rule",
                columnNames = {"audience", "role_name", "class_id", "section", "rule_type"}))
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolAttendanceRule extends BaseEntity {

    public static final Long STAFF_CLASS_ID = 0L;
    public static final String STAFF_SECTION = "";

    @Column(name = "audience", nullable = false, length = 20)
    private String audience;

    @Column(name = "role_name", nullable = false, length = 50)
    private String roleName;

    @Column(name = "class_id")
    @Builder.Default
    private Long classId = STAFF_CLASS_ID;

    @Column(name = "section", length = 20)
    @Builder.Default
    private String section = STAFF_SECTION;

    @Column(name = "rule_type", nullable = false, length = 5)
    private String ruleType;

    @Column(name = "entry_from", length = 12)
    private String entryFrom;

    @Column(name = "entry_upto", length = 12)
    private String entryUpto;

    @Column(name = "total_hour", length = 12)
    private String totalHour;
}
