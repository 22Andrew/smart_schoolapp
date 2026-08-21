package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "backup_setting")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupSetting extends BaseEntity {

    @Column(name = "cron_secret_key", nullable = false, length = 64)
    private String cronSecretKey;
}
