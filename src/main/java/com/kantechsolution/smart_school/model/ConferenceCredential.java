package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conference_credentials")
public class ConferenceCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_key", length = 500)
    private String apiKey = "";

    @Column(name = "api_secret", length = 500)
    private String apiSecret = "";

    @Column(name = "redirect_url", length = 500)
    private String redirectUrl = "";

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken = "";

    @Column(name = "teacher_api_credential", nullable = false, columnDefinition = "BIT(1) DEFAULT 0")
    private boolean teacherApiCredential = false;

    @Column(name = "staff_zoom_client", length = 20)
    private String staffZoomClient = "zoom_app";

    @Column(name = "student_zoom_client", length = 20)
    private String studentZoomClient = "zoom_app";

    @Column(name = "parent_live_class", nullable = false, columnDefinition = "BIT(1) DEFAULT 0")
    private boolean parentLiveClass = false;

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

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public boolean isTeacherApiCredential() {
        return teacherApiCredential;
    }

    public void setTeacherApiCredential(boolean teacherApiCredential) {
        this.teacherApiCredential = teacherApiCredential;
    }

    public String getStaffZoomClient() {
        return staffZoomClient;
    }

    public void setStaffZoomClient(String staffZoomClient) {
        this.staffZoomClient = staffZoomClient;
    }

    public String getStudentZoomClient() {
        return studentZoomClient;
    }

    public void setStudentZoomClient(String studentZoomClient) {
        this.studentZoomClient = studentZoomClient;
    }

    public boolean isParentLiveClass() {
        return parentLiveClass;
    }

    public void setParentLiveClass(boolean parentLiveClass) {
        this.parentLiveClass = parentLiveClass;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
