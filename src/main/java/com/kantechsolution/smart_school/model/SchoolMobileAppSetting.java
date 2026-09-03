package com.kantechsolution.smart_school.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_mobile_app_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolMobileAppSetting extends BaseEntity {

    @Column(name = "api_url", nullable = false, length = 500)
    private String apiUrl;

    @Column(name = "primary_color", nullable = false, length = 20)
    private String primaryColor;

    @Column(name = "secondary_color", nullable = false, length = 20)
    private String secondaryColor;

    @Column(name = "envato_purchase_code", length = 500)
    private String envatoPurchaseCode;

    @Column(name = "envato_email", length = 255)
    private String envatoEmail;

    @Column(name = "fcm_server_key", length = 500)
    private String fcmServerKey;
}
