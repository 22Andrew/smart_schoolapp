package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transport_fee_months")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportFeeMonth extends BaseEntity {

    public enum FineType {
        NONE, PERCENTAGE, FIX
    }

    @Column(name = "month_name", nullable = false, unique = true, length = 20)
    private String monthName;

    @Column(name = "month_index", nullable = false)
    private Integer monthIndex;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "fine_type", length = 20)
    private FineType fineType = FineType.NONE;

    @Column(precision = 8, scale = 2)
    private BigDecimal percentage;

    @Column(name = "fixed_amount", precision = 12, scale = 2)
    private BigDecimal fixedAmount;
}
