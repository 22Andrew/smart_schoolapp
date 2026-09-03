package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_fees_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolFeesSetting extends BaseEntity {

    @Column(name = "offline_bank_payment_in_student_panel", nullable = false)
    private Boolean offlineBankPaymentInStudentPanel;

    @Column(name = "offline_bank_payment_instruction", columnDefinition = "TEXT")
    private String offlineBankPaymentInstruction;

    @Column(name = "lock_student_panel_if_fees_remaining", nullable = false)
    private Boolean lockStudentPanelIfFeesRemaining;

    @Column(name = "print_fees_receipt_office_copy", nullable = false)
    private Boolean printFeesReceiptOfficeCopy;

    @Column(name = "print_fees_receipt_student_copy", nullable = false)
    private Boolean printFeesReceiptStudentCopy;

    @Column(name = "print_fees_receipt_bank_copy", nullable = false)
    private Boolean printFeesReceiptBankCopy;

    @Column(name = "carry_forward_fees_due_days", nullable = false)
    private Integer carryForwardFeesDueDays;

    @Column(name = "single_page_fees_print", nullable = false)
    private Boolean singlePageFeesPrint;

    @Column(name = "collect_fees_in_back_date", nullable = false)
    private Boolean collectFeesInBackDate;

    @Column(name = "student_guardian_panel_fees_discount", nullable = false)
    private Boolean studentGuardianPanelFeesDiscount;

    @Column(name = "display_previous_fees", nullable = false)
    private Boolean displayPreviousFees;

    @Column(name = "allow_student_partial_payment", nullable = false)
    private Boolean allowStudentPartialPayment;
}
