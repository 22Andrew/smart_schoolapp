package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense extends BaseEntity {

    @Column(name = "expense_head", nullable = false, length = 100)
    private String expenseHead;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 2000)
    private String description;

    @Column(name = "document_path", length = 500)
    private String documentPath;
}
