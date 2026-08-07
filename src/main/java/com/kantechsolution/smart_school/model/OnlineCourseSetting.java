package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "online_course_settings")
public class OnlineCourseSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enable_quiz", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean enableQuiz = true;

    @Column(name = "enable_exam", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean enableExam = true;

    @Column(name = "enable_assignment", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean enableAssignment = true;

    @Column(name = "aws_access_key", length = 255)
    private String awsAccessKey = "";

    @Column(name = "aws_secret_key", length = 500)
    private String awsSecretKey = "";

    @Column(name = "aws_bucket_name", length = 255)
    private String awsBucketName = "";

    @Column(name = "aws_region", length = 100)
    private String awsRegion = "";

    @Column(name = "guest_login_enabled", nullable = false, columnDefinition = "BIT(1) DEFAULT 1")
    private boolean guestLoginEnabled = true;

    @Column(name = "guest_prefix", length = 100)
    private String guestPrefix = "Guest";

    @Column(name = "guest_id_start")
    private Integer guestIdStart = 100;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isEnableQuiz() {
        return enableQuiz;
    }

    public void setEnableQuiz(boolean enableQuiz) {
        this.enableQuiz = enableQuiz;
    }

    public boolean isEnableExam() {
        return enableExam;
    }

    public void setEnableExam(boolean enableExam) {
        this.enableExam = enableExam;
    }

    public boolean isEnableAssignment() {
        return enableAssignment;
    }

    public void setEnableAssignment(boolean enableAssignment) {
        this.enableAssignment = enableAssignment;
    }

    public String getAwsAccessKey() {
        return awsAccessKey;
    }

    public void setAwsAccessKey(String awsAccessKey) {
        this.awsAccessKey = awsAccessKey;
    }

    public String getAwsSecretKey() {
        return awsSecretKey;
    }

    public void setAwsSecretKey(String awsSecretKey) {
        this.awsSecretKey = awsSecretKey;
    }

    public String getAwsBucketName() {
        return awsBucketName;
    }

    public void setAwsBucketName(String awsBucketName) {
        this.awsBucketName = awsBucketName;
    }

    public String getAwsRegion() {
        return awsRegion;
    }

    public void setAwsRegion(String awsRegion) {
        this.awsRegion = awsRegion;
    }

    public boolean isGuestLoginEnabled() {
        return guestLoginEnabled;
    }

    public void setGuestLoginEnabled(boolean guestLoginEnabled) {
        this.guestLoginEnabled = guestLoginEnabled;
    }

    public String getGuestPrefix() {
        return guestPrefix;
    }

    public void setGuestPrefix(String guestPrefix) {
        this.guestPrefix = guestPrefix;
    }

    public Integer getGuestIdStart() {
        return guestIdStart;
    }

    public void setGuestIdStart(Integer guestIdStart) {
        this.guestIdStart = guestIdStart;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
