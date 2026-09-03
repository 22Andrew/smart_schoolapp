package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gmeet_live_classes")
public class GmeetLiveClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_title", nullable = false, length = 300)
    private String classTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "class_date_time", nullable = false)
    private LocalDateTime classDateTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(length = 100)
    private String role;

    @Column(name = "staff_name", length = 200)
    private String staffName;

    @Column(name = "staff_id", length = 50)
    private String staffId;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(length = 50)
    private String section;

    @Column(name = "class_sections", columnDefinition = "TEXT")
    private String classSections;

    @Column(name = "created_by_name", length = 200)
    private String createdByName;

    @Column(name = "created_by_role", length = 100)
    private String createdByRole;

    @Column(name = "created_by_id", length = 50)
    private String createdById;

    @Column(name = "created_for_name", length = 200)
    private String createdForName;

    @Column(name = "created_for_role", length = 100)
    private String createdForRole;

    @Column(name = "created_for_id", length = 50)
    private String createdForId;

    @Column(name = "gmeet_url", length = 500)
    private String gmeetUrl;

    @Column(nullable = false, length = 50)
    private String status = "Awaited";

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

    public String getClassTitle() {
        return classTitle;
    }

    public void setClassTitle(String classTitle) {
        this.classTitle = classTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getClassDateTime() {
        return classDateTime;
    }

    public void setClassDateTime(LocalDateTime classDateTime) {
        this.classDateTime = classDateTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getClassSections() {
        return classSections;
    }

    public void setClassSections(String classSections) {
        this.classSections = classSections;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getCreatedByRole() {
        return createdByRole;
    }

    public void setCreatedByRole(String createdByRole) {
        this.createdByRole = createdByRole;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
    }

    public String getCreatedForName() {
        return createdForName;
    }

    public void setCreatedForName(String createdForName) {
        this.createdForName = createdForName;
    }

    public String getCreatedForRole() {
        return createdForRole;
    }

    public void setCreatedForRole(String createdForRole) {
        this.createdForRole = createdForRole;
    }

    public String getCreatedForId() {
        return createdForId;
    }

    public void setCreatedForId(String createdForId) {
        this.createdForId = createdForId;
    }

    public String getGmeetUrl() {
        return gmeetUrl;
    }

    public void setGmeetUrl(String gmeetUrl) {
        this.gmeetUrl = gmeetUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
