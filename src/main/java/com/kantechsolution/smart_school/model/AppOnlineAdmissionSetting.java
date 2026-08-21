package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "app_online_admission_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppOnlineAdmissionSetting extends BaseEntity {

    @Column(name = "online_admission_enabled", nullable = false)
    @Builder.Default
    private Boolean onlineAdmissionEnabled = true;

    @Column(name = "payment_option_enabled", nullable = false)
    @Builder.Default
    private Boolean paymentOptionEnabled = true;

    @Column(name = "form_fees", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal formFees = new BigDecimal("100.00");

    @Column(name = "application_form_path", length = 500)
    private String applicationFormPath;

    @Column(name = "application_form_name", length = 255)
    private String applicationFormName;

    @Column(columnDefinition = "LONGTEXT")
    private String instructions;

    @Column(name = "terms_conditions", columnDefinition = "LONGTEXT")
    private String termsConditions;
}
