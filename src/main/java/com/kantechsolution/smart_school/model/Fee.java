package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Fee entity for managing student fees
 */
@Entity
@Table(name = "fees")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"student"})
@ToString(exclude = {"student"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fee extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "fee_type", nullable = false, length = 30)
    private FeeType feeType;
    
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;
    
    @Column(name = "transaction_id", length = 100)
    private String transactionId;
    
    @Column(name = "discount_amount")
    @Builder.Default
    private Double discountAmount = 0.0;
    
    @Column(name = "late_fee")
    @Builder.Default
    private Double lateFee = 0.0;
    
    @Column(length = 500)
    private String remarks;
    
    public enum FeeType {
        TUITION_FEE,
        ADMISSION_FEE,
        EXAM_FEE,
        LIBRARY_FEE,
        TRANSPORT_FEE,
        SPORTS_FEE,
        LABORATORY_FEE,
        OTHER
    }
    
    public enum PaymentStatus {
        PENDING,
        PAID,
        PARTIALLY_PAID,
        OVERDUE,
        WAIVED,
        REFUNDED
    }
    
    public enum PaymentMethod {
        CASH,
        CREDIT_CARD,
        DEBIT_CARD,
        BANK_TRANSFER,
        ONLINE_PAYMENT,
        CHEQUE
    }
}
