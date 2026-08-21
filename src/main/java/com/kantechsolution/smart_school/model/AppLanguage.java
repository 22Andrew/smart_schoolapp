package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "app_language")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppLanguage extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "short_code", nullable = false, unique = true, length = 20)
    private String shortCode;

    @Column(name = "country_code", nullable = false, length = 10)
    private String countryCode;

    @Column(name = "is_rtl", nullable = false)
    private Boolean isRtl;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;
}
