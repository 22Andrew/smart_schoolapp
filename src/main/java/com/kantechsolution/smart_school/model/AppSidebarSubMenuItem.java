package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_sidebar_submenu_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_sidebar_submenu_items_parent_slug",
                columnNames = {"parent_menu_slug", "slug"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSidebarSubMenuItem extends BaseEntity {

    @Column(name = "parent_menu_slug", nullable = false, length = 80)
    private String parentMenuSlug;

    @Column(nullable = false, length = 120)
    private String slug;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 255)
    private String href;

    @Column(name = "selected_in_sidebar", nullable = false)
    @Builder.Default
    private Boolean selectedInSidebar = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
