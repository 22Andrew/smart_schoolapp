package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_whatsapp_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolWhatsappSetting extends BaseEntity {

    @Column(name = "front_site_whatsapp_link_enabled", nullable = false)
    private Boolean frontSiteWhatsappLinkEnabled;

    @Column(name = "front_site_mobile_no", length = 20)
    private String frontSiteMobileNo;

    @Column(name = "front_site_time_from", length = 20)
    private String frontSiteTimeFrom;

    @Column(name = "front_site_time_to", length = 20)
    private String frontSiteTimeTo;

    @Column(name = "admin_panel_whatsapp_link_enabled", nullable = false)
    private Boolean adminPanelWhatsappLinkEnabled;

    @Column(name = "admin_panel_mobile_no", length = 20)
    private String adminPanelMobileNo;

    @Column(name = "admin_panel_time_from", length = 20)
    private String adminPanelTimeFrom;

    @Column(name = "admin_panel_time_to", length = 20)
    private String adminPanelTimeTo;

    @Column(name = "student_guardian_panel_whatsapp_link_enabled", nullable = false)
    private Boolean studentGuardianPanelWhatsappLinkEnabled;

    @Column(name = "student_guardian_panel_mobile_no", length = 20)
    private String studentGuardianPanelMobileNo;

    @Column(name = "student_guardian_panel_time_from", length = 20)
    private String studentGuardianPanelTimeFrom;

    @Column(name = "student_guardian_panel_time_to", length = 20)
    private String studentGuardianPanelTimeTo;
}
