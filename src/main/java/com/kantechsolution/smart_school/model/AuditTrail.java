package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_trails")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditTrail extends BaseEntity {

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 150)
    private String username;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(length = 50)
    private String platform;

    @Column(columnDefinition = "TEXT")
    private String agent;

    @Column(name = "event_date_time", nullable = false)
    private LocalDateTime eventDateTime;
}
