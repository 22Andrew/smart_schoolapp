package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gmeet_settings")
public class GmeetSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_key", length = 500)
    private String apiKey = "";

    @Column(name = "api_secret", length = 500)
    private String apiSecret = "";

    @Column(name = "use_google_calendar_api", nullable = false, columnDefinition = "BIT(1) DEFAULT 0")
    private boolean useGoogleCalendarApi = false;

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

    public boolean isUseGoogleCalendarApi() {
        return useGoogleCalendarApi;
    }

    public void setUseGoogleCalendarApi(boolean useGoogleCalendarApi) {
        this.useGoogleCalendarApi = useGoogleCalendarApi;
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
