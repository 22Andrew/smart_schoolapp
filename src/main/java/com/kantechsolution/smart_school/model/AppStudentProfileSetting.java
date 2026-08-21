package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "app_student_profile_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppStudentProfileSetting extends BaseEntity {

    @Column(name = "allow_editable_form_fields", nullable = false)
    @Builder.Default
    private Boolean allowEditableFormFields = false;
}
