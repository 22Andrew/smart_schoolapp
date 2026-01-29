package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * LibraryTransaction entity for tracking book borrowing
 */
@Entity
@Table(name = "library_transactions")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"book", "student"})
@ToString(exclude = {"book", "student"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryTransaction extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Library book;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "return_date")
    private LocalDate returnDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.ISSUED;
    
    @Column(name = "fine_amount")
    @Builder.Default
    private Double fineAmount = 0.0;
    
    @Column(length = 500)
    private String remarks;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuedBy;
    
    public enum TransactionStatus {
        ISSUED,
        RETURNED,
        OVERDUE,
        LOST,
        DAMAGED
    }
}
