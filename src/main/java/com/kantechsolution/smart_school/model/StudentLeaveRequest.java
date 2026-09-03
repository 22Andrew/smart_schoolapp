package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_leave_requests")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentLeaveRequest extends BaseEntity {

    @Column(name = "student_admission_id", nullable = false)
    private Long studentAdmissionId;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(name = "section_name", nullable = false, length = 20)
    private String section;

    @Column(name = "student_name", nullable = false, length = 200)
    private String studentName;

    @Column(name = "admission_no", length = 50)
    private String admissionNo;

    @Column(name = "apply_date", nullable = false)
    private LocalDate applyDate;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(length = 2000)
    private String reason;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Pending";

    @Column(name = "approved_by_name", length = 100)
    private String approvedByName;

    @Column(name = "approved_by_staff_id", length = 50)
    private String approvedByStaffId;

    @Column(name = "action_date")
    private LocalDate actionDate;

    @Column(name = "document_path", length = 500)
    private String documentPath;
}
