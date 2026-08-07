package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "online_course_certificate_templates")
public class OnlineCourseCertificateTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_name", nullable = false, length = 255)
    private String certificateName;

    @Column(name = "certificate_text", nullable = false, columnDefinition = "TEXT")
    private String certificateText;

    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;

    @Column(name = "design_font", length = 100)
    private String designFont = "Arial";

    @Column(name = "design_font_size", length = 20)
    private String designFontSize = "16";

    @Column(name = "design_text_color", length = 30)
    private String designTextColor = "#000000";

    @Column(name = "design_title_color", length = 30)
    private String designTitleColor = "#000000";

    @Column(name = "design_layout", length = 50)
    private String designLayout = "Portrait";

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

    public String getCertificateName() {
        return certificateName;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public String getCertificateText() {
        return certificateText;
    }

    public void setCertificateText(String certificateText) {
        this.certificateText = certificateText;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public String getDesignFont() {
        return designFont;
    }

    public void setDesignFont(String designFont) {
        this.designFont = designFont;
    }

    public String getDesignFontSize() {
        return designFontSize;
    }

    public void setDesignFontSize(String designFontSize) {
        this.designFontSize = designFontSize;
    }

    public String getDesignTextColor() {
        return designTextColor;
    }

    public void setDesignTextColor(String designTextColor) {
        this.designTextColor = designTextColor;
    }

    public String getDesignTitleColor() {
        return designTitleColor;
    }

    public void setDesignTitleColor(String designTitleColor) {
        this.designTitleColor = designTitleColor;
    }

    public String getDesignLayout() {
        return designLayout;
    }

    public void setDesignLayout(String designLayout) {
        this.designLayout = designLayout;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
