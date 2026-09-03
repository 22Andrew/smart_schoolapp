package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_login_background_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolLoginBackgroundSetting extends BaseEntity {

    @Column(name = "admin_panel_background_path", length = 500)
    private String adminPanelBackgroundPath;

    @Column(name = "user_panel_background_path", length = 500)
    private String userPanelBackgroundPath;
}
