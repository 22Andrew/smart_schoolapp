package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "whatsapp_config")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhatsappConfig extends BaseEntity {

    @Column(name = "active_provider", nullable = false, length = 20)
    private String activeProvider;

    @Lob
    @Column(name = "meta_access_token", columnDefinition = "TEXT")
    private String metaAccessToken;

    @Column(name = "meta_phone_number", length = 50)
    private String metaPhoneNumber;

    @Column(name = "meta_language", length = 20)
    private String metaLanguage;

    @Column(name = "meta_status", length = 20)
    private String metaStatus;

    @Column(name = "twilio_account_sid", length = 120)
    private String twilioAccountSid;

    @Lob
    @Column(name = "twilio_auth_token", columnDefinition = "TEXT")
    private String twilioAuthToken;

    @Column(name = "twilio_from_number", length = 50)
    private String twilioFromNumber;

    @Column(name = "twilio_status", length = 20)
    private String twilioStatus;
}
