package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_system_fields", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_system_fields_type_slug", columnNames = {"field_type", "slug"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSystemField extends BaseEntity {

    @Column(name = "field_type", nullable = false, length = 20)
    private String fieldType;

    @Column(nullable = false, length = 80)
    private String slug;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
