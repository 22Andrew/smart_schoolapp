package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "staff_payroll_records", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"staff_member_id", "payroll_month", "payroll_year"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffPayrollRecord extends BaseEntity {

    @Column(name = "staff_member_id", nullable = false)
    private Long staffMemberId;

    @Column(name = "payroll_month", nullable = false)
    private Integer payrollMonth;

    @Column(name = "payroll_year", nullable = false)
    private Integer payrollYear;

    @Column(name = "payslip_no", length = 50)
    private String payslipNo;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Paid";

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_mode", length = 50)
    @Builder.Default
    private String paymentMode = "Cash";

    @Column(name = "basic_salary")
    @Builder.Default
    private Double basicSalary = 0.0;

    @Column(name = "total_earning")
    @Builder.Default
    private Double totalEarning = 0.0;

    @Column(name = "total_deduction")
    @Builder.Default
    private Double totalDeduction = 0.0;

    @Column
    @Builder.Default
    private Double tax = 0.0;

    @Column(name = "gross_salary")
    @Builder.Default
    private Double grossSalary = 0.0;

    @Column(name = "net_salary")
    @Builder.Default
    private Double netSalary = 0.0;

    @Column(name = "earnings_json", columnDefinition = "TEXT")
    private String earningsJson;

    @Column(name = "deductions_json", columnDefinition = "TEXT")
    private String deductionsJson;

    @Column(name = "is_reverted")
    @Builder.Default
    private Boolean reverted = false;

    @Column(name = "payment_note", columnDefinition = "TEXT")
    private String paymentNote;
}
