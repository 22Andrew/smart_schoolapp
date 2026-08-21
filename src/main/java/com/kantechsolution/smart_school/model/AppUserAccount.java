package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

@Entity
@Table(name = "app_user_accounts", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_user_accounts_type_source", columnNames = {"user_type", "source_id"}),
        @UniqueConstraint(name = "uk_app_user_accounts_username", columnNames = {"username"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUserAccount extends BaseEntity {

    @Column(name = "user_type", nullable = false, length = 20)
    private String userType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(name = "login_enabled", nullable = false)
    @Builder.Default
    private Boolean loginEnabled = true;
}
