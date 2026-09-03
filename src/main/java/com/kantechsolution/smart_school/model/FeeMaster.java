package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Fees Master entry linking a fees group and fees type for a session.
 */
@Entity
@Table(name = "fee_masters")
public class FeeMaster {

    public enum FineType {
        NONE,
        FIX_AMOUNT,
        PERCENTAGE,
        CUMULATIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fee_group_id", nullable = false)
    private FeeGroup feeGroup;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fee_type_id", nullable = false)
    private FeeType feeType;

    @Column(name = "session_year", nullable = false, length = 20)
    private String sessionYear = "2026-27";

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "fine_type", nullable = false, length = 20)
    private FineType fineType = FineType.NONE;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "fix_amount")
    private Double fixAmount;

    @Column(name = "per_day", nullable = false)
    private boolean perDay = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public FeeMaster() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FeeGroup getFeeGroup() {
        return feeGroup;
    }

    public void setFeeGroup(FeeGroup feeGroup) {
        this.feeGroup = feeGroup;
    }

    public FeeType getFeeType() {
        return feeType;
    }

    public void setFeeType(FeeType feeType) {
        this.feeType = feeType;
    }

    public String getSessionYear() {
        return sessionYear;
    }

    public void setSessionYear(String sessionYear) {
        this.sessionYear = sessionYear;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public FineType getFineType() {
        return fineType;
    }

    public void setFineType(FineType fineType) {
        this.fineType = fineType;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Double getFixAmount() {
        return fixAmount;
    }

    public void setFixAmount(Double fixAmount) {
        this.fixAmount = fixAmount;
    }

    public boolean isPerDay() {
        return perDay;
    }

    public void setPerDay(boolean perDay) {
        this.perDay = perDay;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
