package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "app_addons")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppAddon extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_key", nullable = false, length = 60)
    private String iconKey;

    @Column(name = "is_installed", nullable = false)
    private Boolean isInstalled;

    @Column(name = "file_name", length = 255)
    private String fileName;
}
