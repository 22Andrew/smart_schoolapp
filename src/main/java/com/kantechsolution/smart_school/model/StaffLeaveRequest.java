package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "staff_leave_requests")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffLeaveRequest extends BaseEntity {

    @Column(name = "staff_member_id", nullable = false)
    private Long staffMemberId;

    @Column(name = "staff_name", nullable = false, length = 200)
    private String staffName;

    @Column(name = "staff_id_code", nullable = false, length = 50)
    private String staffIdCode;

    @Column(nullable = false, length = 100)
    private String role;

    @Column(name = "leave_type", nullable = false, length = 100)
    private String leaveType;

    @Column(name = "half_day", length = 30)
    private String halfDay;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal days;

    @Column(name = "apply_date", nullable = false)
    private LocalDate applyDate;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(length = 2000)
    private String reason;

    @Column(length = 2000)
    private String note;

    @Column(name = "submitted_by_name", length = 100)
    private String submittedByName;

    @Column(name = "submitted_by_staff_id", length = 50)
    private String submittedByStaffId;

    @Column(name = "document_path", length = 500)
    private String documentPath;
}
