package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_logo_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolLogoSetting extends BaseEntity {

    @Column(name = "print_logo_path", length = 500)
    private String printLogoPath;

    @Column(name = "admin_logo_path", length = 500)
    private String adminLogoPath;

    @Column(name = "admin_small_logo_path", length = 500)
    private String adminSmallLogoPath;

    @Column(name = "app_logo_path", length = 500)
    private String appLogoPath;
}
