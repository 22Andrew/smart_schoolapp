package com.kantechsolution.smart_school.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Controls one-time / automatic restore of the canonical SQL backup that contains
 * real school data (students, staff, fees, exams, etc.).
 *
 * <ul>
 *   <li>{@code off} – never restore</li>
 *   <li>{@code auto} – restore when the database looks empty or demo-only (default)</li>
 *   <li>{@code force} – always restore (drops and recreates all tables from backup)</li>
 * </ul>
 */
@Component
@ConfigurationProperties(prefix = "app.database")
@Data
public class DatabaseBootstrapProperties {

    /**
     * off | auto | force  (also accepts true/false as aliases for auto/off)
     */
    private String bootstrapFromBackup = "auto";

    private String bootstrapBackupFile = "db_ver_7.1.0_2026-08-21_12-25-41.sql";

    /**
     * When true (default), restore the SQL backup if more than {@link #incompleteTableThresholdPercent}
     * of base tables are still empty — even when some demo rows already exist.
     */
    private boolean bootstrapIfIncomplete = true;

    /**
     * Fraction of empty tables (0–100) that triggers an incomplete-database restore in {@code auto} mode.
     */
    private int incompleteTableThresholdPercent = 12;

    public boolean isEnabled() {
        return !isOff();
    }

    public boolean isOff() {
        String mode = normalizedMode();
        return "off".equals(mode) || "false".equals(mode);
    }

    public boolean isForce() {
        return "force".equals(normalizedMode());
    }

    public boolean isAuto() {
        String mode = normalizedMode();
        return "auto".equals(mode) || "true".equals(mode);
    }

    private String normalizedMode() {
        if (bootstrapFromBackup == null || bootstrapFromBackup.isBlank()) {
            return "auto";
        }
        return bootstrapFromBackup.trim().toLowerCase();
    }
}
