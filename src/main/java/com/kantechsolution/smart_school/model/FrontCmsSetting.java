package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "front_cms_setting")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrontCmsSetting extends BaseEntity {

    @Column(name = "front_cms_enabled", nullable = false)
    private Boolean frontCmsEnabled;

    @Column(name = "sidebar_enabled", nullable = false)
    private Boolean sidebarEnabled;

    @Column(name = "language_rtl", nullable = false)
    private Boolean languageRtl;

    @Column(name = "sidebar_news", nullable = false)
    private Boolean sidebarNews;

    @Column(name = "sidebar_complain", nullable = false)
    private Boolean sidebarComplain;

    @Column(name = "language", nullable = false, length = 40)
    private String language;

    @Column(name = "logo_path", length = 400)
    private String logoPath;

    @Column(name = "favicon_path", length = 400)
    private String faviconPath;

    @Column(name = "footer_text", length = 400)
    private String footerText;

    @Lob
    @Column(name = "cookie_consent", columnDefinition = "TEXT")
    private String cookieConsent;

    @Lob
    @Column(name = "google_analytics", columnDefinition = "TEXT")
    private String googleAnalytics;

    @Column(name = "whatsapp_url", length = 400)
    private String whatsappUrl;

    @Column(name = "facebook_url", length = 400)
    private String facebookUrl;

    @Column(name = "twitter_url", length = 400)
    private String twitterUrl;

    @Column(name = "youtube_url", length = 400)
    private String youtubeUrl;

    @Column(name = "google_plus_url", length = 400)
    private String googlePlusUrl;

    @Column(name = "linkedin_url", length = 400)
    private String linkedinUrl;

    @Column(name = "instagram_url", length = 400)
    private String instagramUrl;

    @Column(name = "pinterest_url", length = 400)
    private String pinterestUrl;

    @Column(name = "current_theme", nullable = false, length = 40)
    private String currentTheme;
}
