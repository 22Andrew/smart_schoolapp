package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "payment_gateway_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentGatewaySetting extends BaseEntity {

    @Column(name = "gateway", nullable = false, unique = true, length = 40)
    private String gateway;

    @Lob
    @Column(name = "settings_json", columnDefinition = "TEXT")
    private String settingsJson;
}
