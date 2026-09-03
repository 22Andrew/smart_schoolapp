package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gmeet_live_meetings")
public class GmeetLiveMeeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meeting_title", nullable = false, length = 300)
    private String meetingTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "meeting_date_time", nullable = false)
    private LocalDateTime meetingDateTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "gmeet_url", length = 500)
    private String gmeetUrl;

    @Column(name = "created_by_label", length = 100)
    private String createdByLabel = "Self";

    @Column(name = "staff_members", columnDefinition = "TEXT")
    private String staffMembers;

    @Column(name = "staff_ids", length = 500)
    private String staffIds;

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

    public String getMeetingTitle() {
        return meetingTitle;
    }

    public void setMeetingTitle(String meetingTitle) {
        this.meetingTitle = meetingTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getMeetingDateTime() {
        return meetingDateTime;
    }

    public void setMeetingDateTime(LocalDateTime meetingDateTime) {
        this.meetingDateTime = meetingDateTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getGmeetUrl() {
        return gmeetUrl;
    }

    public void setGmeetUrl(String gmeetUrl) {
        this.gmeetUrl = gmeetUrl;
    }

    public String getCreatedByLabel() {
        return createdByLabel;
    }

    public void setCreatedByLabel(String createdByLabel) {
        this.createdByLabel = createdByLabel;
    }

    public String getStaffMembers() {
        return staffMembers;
    }

    public void setStaffMembers(String staffMembers) {
        this.staffMembers = staffMembers;
    }

    public String getStaffIds() {
        return staffIds;
    }

    public void setStaffIds(String staffIds) {
        this.staffIds = staffIds;
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
