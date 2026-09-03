package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "academic_sessions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicSession extends BaseEntity {

    @Column(name = "session_name", nullable = false, unique = true, length = 20)
    private String sessionName;

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private Boolean current = false;
}
