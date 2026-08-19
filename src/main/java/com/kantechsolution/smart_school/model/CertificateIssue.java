package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "certificate_issues")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateIssue extends BaseEntity {

    @Column(name = "issue_type", nullable = false, length = 40)
    private String issueType;

    @Column(name = "document_number", length = 50)
    private String documentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private StudentAdmission student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private StaffMember staff;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "leaving_date")
    private LocalDate leavingDate;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "last_class", length = 100)
    private String lastClass;

    @Column(name = "qualified", length = 100)
    private String qualified;

    @Column(name = "dues_paid", length = 50)
    private String duesPaid;

    @Column(name = "conduct", length = 100)
    private String conduct;
}
