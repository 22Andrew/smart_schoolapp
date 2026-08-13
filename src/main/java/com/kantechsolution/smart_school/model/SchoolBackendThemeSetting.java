package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_backend_theme_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolBackendThemeSetting extends BaseEntity {

    @Column(name = "theme_mode", nullable = false, length = 20)
    private String themeMode;

    @Column(name = "skin", nullable = false, length = 20)
    private String skin;

    @Column(name = "side_menu_style", nullable = false, length = 20)
    private String sideMenuStyle;

    @Column(name = "primary_color", nullable = false, length = 20)
    private String primaryColor;

    @Column(name = "box_content", nullable = false, length = 20)
    private String boxContent;
}
