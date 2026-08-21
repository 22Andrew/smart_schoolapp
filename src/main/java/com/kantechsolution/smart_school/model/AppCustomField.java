package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "app_custom_fields")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppCustomField extends BaseEntity {

    @Column(name = "belong_to", nullable = false, length = 50)
    private String belongTo;

    @Column(name = "field_type", nullable = false, length = 50)
    private String fieldType;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "bs_column", nullable = false)
    @Builder.Default
    private Integer bsColumn = 12;

    @Column(name = "field_values", columnDefinition = "TEXT")
    private String fieldValues;

    @Column(name = "required_field", nullable = false)
    @Builder.Default
    private Boolean requiredField = false;

    @Column(name = "visible_on_table", nullable = false)
    @Builder.Default
    private Boolean visibleOnTable = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer weight = 0;
}
