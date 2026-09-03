package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "email_config")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailConfig extends BaseEntity {

    @Column(name = "email_engine", nullable = false, length = 30)
    private String emailEngine;

    @Column(name = "from_email", length = 150)
    private String fromEmail;

    @Column(name = "smtp_username", length = 150)
    private String smtpUsername;

    @Lob
    @Column(name = "smtp_password", columnDefinition = "TEXT")
    private String smtpPassword;

    @Column(name = "smtp_server", length = 150)
    private String smtpServer;

    @Column(name = "smtp_port", length = 10)
    private String smtpPort;

    @Column(name = "smtp_security", length = 20)
    private String smtpSecurity;

    @Column(name = "smtp_auth", length = 10)
    private String smtpAuth;

    @Column(name = "aws_access_key_id", length = 100)
    private String awsAccessKeyId;

    @Lob
    @Column(name = "aws_secret_access_key", columnDefinition = "TEXT")
    private String awsSecretAccessKey;

    @Column(name = "aws_region", length = 40)
    private String awsRegion;
}
