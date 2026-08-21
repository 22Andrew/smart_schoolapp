package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_modules", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_modules_type_slug", columnNames = {"module_type", "slug"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppModule extends BaseEntity {

    @Column(name = "module_type", nullable = false, length = 20)
    private String moduleType;

    @Column(nullable = false, length = 80)
    private String slug;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
