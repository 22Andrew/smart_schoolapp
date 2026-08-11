package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "multibranch_overview")
public class MultiBranchOverview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_type", nullable = false, length = 50)
    private String sectionType;

    @Column(name = "branch_name", nullable = false, length = 200)
    private String branchName;

    @Column(name = "current_session", length = 50)
    private String currentSession;

    @Column(name = "total_students")
    private Integer totalStudents;

    @Column(name = "total_fees")
    private Double totalFees;

    @Column(name = "total_paid_fees")
    private Double totalPaidFees;

    @Column(name = "total_balance_fees")
    private Double totalBalanceFees;

    @Column(name = "offline_admission")
    private Integer offlineAdmission;

    @Column(name = "online_admission")
    private Integer onlineAdmission;

    @Column(name = "total_books")
    private Integer totalBooks;

    private Integer members;

    @Column(name = "books_issued")
    private Integer booksIssued;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSectionType() {
        return sectionType;
    }

    public void setSectionType(String sectionType) {
        this.sectionType = sectionType;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getCurrentSession() {
        return currentSession;
    }

    public void setCurrentSession(String currentSession) {
        this.currentSession = currentSession;
    }

    public Integer getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Integer totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Double getTotalFees() {
        return totalFees;
    }

    public void setTotalFees(Double totalFees) {
        this.totalFees = totalFees;
    }

    public Double getTotalPaidFees() {
        return totalPaidFees;
    }

    public void setTotalPaidFees(Double totalPaidFees) {
        this.totalPaidFees = totalPaidFees;
    }

    public Double getTotalBalanceFees() {
        return totalBalanceFees;
    }

    public void setTotalBalanceFees(Double totalBalanceFees) {
        this.totalBalanceFees = totalBalanceFees;
    }

    public Integer getOfflineAdmission() {
        return offlineAdmission;
    }

    public void setOfflineAdmission(Integer offlineAdmission) {
        this.offlineAdmission = offlineAdmission;
    }

    public Integer getOnlineAdmission() {
        return onlineAdmission;
    }

    public void setOnlineAdmission(Integer onlineAdmission) {
        this.onlineAdmission = onlineAdmission;
    }

    public Integer getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(Integer totalBooks) {
        this.totalBooks = totalBooks;
    }

    public Integer getMembers() {
        return members;
    }

    public void setMembers(Integer members) {
        this.members = members;
    }

    public Integer getBooksIssued() {
        return booksIssued;
    }

    public void setBooksIssued(Integer booksIssued) {
        this.booksIssued = booksIssued;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
