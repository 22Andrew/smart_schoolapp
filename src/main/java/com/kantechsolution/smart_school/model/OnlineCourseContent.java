package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "online_course_contents")
public class OnlineCourseContent {

    public enum ContentType {
        LESSON, QUIZ, EXAM, ASSIGNMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private OnlineCourseSection section;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    private ContentType contentType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(length = 50)
    private String duration;

    @Column(name = "lesson_type", length = 50)
    private String lessonType;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "exam_from")
    private LocalDate examFrom;

    @Column(name = "exam_to")
    private LocalDate examTo;

    @Column(name = "exam_duration", length = 50)
    private String examDuration;

    @Column(name = "passing_percentage")
    private Integer passingPercentage;

    @Column(name = "assignment_date")
    private LocalDate assignmentDate;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(name = "max_marks")
    private Double maxMarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OnlineCourseSection getSection() {
        return section;
    }

    public void setSection(OnlineCourseSection section) {
        this.section = section;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getLessonType() {
        return lessonType;
    }

    public void setLessonType(String lessonType) {
        this.lessonType = lessonType;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDate getExamFrom() {
        return examFrom;
    }

    public void setExamFrom(LocalDate examFrom) {
        this.examFrom = examFrom;
    }

    public LocalDate getExamTo() {
        return examTo;
    }

    public void setExamTo(LocalDate examTo) {
        this.examTo = examTo;
    }

    public String getExamDuration() {
        return examDuration;
    }

    public void setExamDuration(String examDuration) {
        this.examDuration = examDuration;
    }

    public Integer getPassingPercentage() {
        return passingPercentage;
    }

    public void setPassingPercentage(Integer passingPercentage) {
        this.passingPercentage = passingPercentage;
    }

    public LocalDate getAssignmentDate() {
        return assignmentDate;
    }

    public void setAssignmentDate(LocalDate assignmentDate) {
        this.assignmentDate = assignmentDate;
    }

    public LocalDate getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDate submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
