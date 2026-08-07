package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Online course listing for the LMS Course List page.
 */
@Entity
@Table(name = "online_courses")
public class OnlineCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 150)
    private String category;

    @Column(name = "class_label", length = 100)
    private String classLabel;

    @Column(name = "instructor_name", length = 150)
    private String instructorName;

    @Column(name = "instructor_code", length = 50)
    private String instructorCode;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "theme_color", length = 30)
    private String themeColor;

    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    @Column(name = "lesson_count")
    private Integer lessonCount = 0;

    @Column(name = "lesson_duration", length = 50)
    private String lessonDuration;

    @Column(name = "exam_count")
    private Integer examCount = 0;

    @Column(name = "quiz_count")
    private Integer quizCount = 0;

    @Column(name = "assignment_count")
    private Integer assignmentCount = 0;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "discount_price")
    private Double discountPrice;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "outcomes", columnDefinition = "TEXT")
    private String outcomes;

    @Column(name = "section_labels", length = 255)
    private String sectionLabels;

    @Column(name = "preview_platform", length = 50)
    private String previewPlatform = "Youtube";

    @Column(name = "preview_url", length = 500)
    private String previewUrl;

    @Column(name = "free_course", nullable = false, columnDefinition = "BIT(1) DEFAULT 0")
    private boolean freeCourse = false;

    @Column(name = "front_visibility", length = 20)
    private String frontVisibility = "Yes";

    @Column(name = "certificate", length = 150)
    private String certificate;

    @Column(name = "created_by_name", length = 150)
    private String createdByName = "Joe Black";

    @Column(name = "created_by_code", length = 50)
    private String createdByCode = "9000";

    @Column(name = "published", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean published = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (lastUpdated == null) {
            lastUpdated = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        lastUpdated = LocalDate.now();
    }

    public OnlineCourse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getClassLabel() {
        return classLabel;
    }

    public void setClassLabel(String classLabel) {
        this.classLabel = classLabel;
    }

    public String getInstructorName() {
        return instructorName;
    }

    public void setInstructorName(String instructorName) {
        this.instructorName = instructorName;
    }

    public String getInstructorCode() {
        return instructorCode;
    }

    public void setInstructorCode(String instructorCode) {
        this.instructorCode = instructorCode;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getThemeColor() {
        return themeColor;
    }

    public void setThemeColor(String themeColor) {
        this.themeColor = themeColor;
    }

    public LocalDate getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDate lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Integer getLessonCount() {
        return lessonCount;
    }

    public void setLessonCount(Integer lessonCount) {
        this.lessonCount = lessonCount;
    }

    public String getLessonDuration() {
        return lessonDuration;
    }

    public void setLessonDuration(String lessonDuration) {
        this.lessonDuration = lessonDuration;
    }

    public Integer getExamCount() {
        return examCount;
    }

    public void setExamCount(Integer examCount) {
        this.examCount = examCount;
    }

    public Integer getQuizCount() {
        return quizCount;
    }

    public void setQuizCount(Integer quizCount) {
        this.quizCount = quizCount;
    }

    public Integer getAssignmentCount() {
        return assignmentCount;
    }

    public void setAssignmentCount(Integer assignmentCount) {
        this.assignmentCount = assignmentCount;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getDiscountPrice() {
        return discountPrice;
    }

    public void setDiscountPrice(Double discountPrice) {
        this.discountPrice = discountPrice;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getOutcomes() {
        return outcomes;
    }

    public void setOutcomes(String outcomes) {
        this.outcomes = outcomes;
    }

    public String getSectionLabels() {
        return sectionLabels;
    }

    public void setSectionLabels(String sectionLabels) {
        this.sectionLabels = sectionLabels;
    }

    public String getPreviewPlatform() {
        return previewPlatform;
    }

    public void setPreviewPlatform(String previewPlatform) {
        this.previewPlatform = previewPlatform;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }

    public boolean isFreeCourse() {
        return freeCourse;
    }

    public void setFreeCourse(boolean freeCourse) {
        this.freeCourse = freeCourse;
    }

    public String getFrontVisibility() {
        return frontVisibility;
    }

    public void setFrontVisibility(String frontVisibility) {
        this.frontVisibility = frontVisibility;
    }

    public String getCertificate() {
        return certificate;
    }

    public void setCertificate(String certificate) {
        this.certificate = certificate;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getCreatedByCode() {
        return createdByCode;
    }

    public void setCreatedByCode(String createdByCode) {
        this.createdByCode = createdByCode;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
