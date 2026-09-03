package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "app_currency")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppCurrency extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "short_code", nullable = false, unique = true, length = 10)
    private String shortCode;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(name = "conversion_rate", nullable = false, precision = 18, scale = 6)
    private BigDecimal conversionRate;

    @Column(name = "is_base", nullable = false)
    private Boolean isBase;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;
}
