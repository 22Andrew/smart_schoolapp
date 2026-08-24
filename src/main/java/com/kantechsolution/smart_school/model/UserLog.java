package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLog extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String username;

    @Column(nullable = false, length = 80)
    private String role;

    @Column(name = "user_category", nullable = false, length = 20)
    private String userCategory;

    @Column(name = "class_label", length = 80)
    private String classLabel;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "login_date_time", nullable = false)
    private LocalDateTime loginDateTime;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
}
