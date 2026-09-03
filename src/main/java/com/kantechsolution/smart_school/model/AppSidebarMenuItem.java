package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_sidebar_menu_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_sidebar_menu_items_slug", columnNames = "slug")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSidebarMenuItem extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String slug;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "selected_in_sidebar", nullable = false)
    @Builder.Default
    private Boolean selectedInSidebar = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
