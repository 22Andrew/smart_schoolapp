package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_online_admission_fields", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_online_admission_fields_slug", columnNames = "slug")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppOnlineAdmissionField extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String slug;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(name = "field_source", nullable = false, length = 20)
    private String fieldSource;

    @Column(name = "custom_field_id")
    private Long customFieldId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
