package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_student_dashboard_widgets", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_student_dashboard_widgets_slug", columnNames = "slug")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppStudentDashboardWidget extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String slug;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(name = "student_enabled", nullable = false)
    @Builder.Default
    private Boolean studentEnabled = true;

    @Column(name = "parent_enabled", nullable = false)
    @Builder.Default
    private Boolean parentEnabled = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
