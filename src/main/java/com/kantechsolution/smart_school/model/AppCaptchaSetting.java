package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_captcha_settings", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_captcha_settings_slug", columnNames = "slug")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppCaptchaSetting extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String slug;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = false;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
