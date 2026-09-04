package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_push_tokens", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_push_tokens_device", columnNames = {"device_token"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppPushToken extends BaseEntity {

    @Column(name = "user_type", nullable = false, length = 20)
    private String userType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "device_token", nullable = false, length = 500)
    private String deviceToken;

    @Column(name = "platform", length = 20)
    private String platform;
}
