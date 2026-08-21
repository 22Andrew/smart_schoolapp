package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Order(42)
public class AppStudentDashboardWidgetSchemaMigration implements ApplicationRunner {

    private static final String TABLE_NAME = "app_student_dashboard_widgets";

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        migrateDashboardWidgetSchema();
    }

    private void migrateDashboardWidgetSchema() {
        if (!tableExists(TABLE_NAME)) {
            return;
        }

        if (!columnExists(TABLE_NAME, "student_enabled")) {
            jdbcTemplate.execute(
                    "ALTER TABLE app_student_dashboard_widgets "
                            + "ADD COLUMN student_enabled TINYINT(1) NOT NULL DEFAULT 1");
        }
        if (!columnExists(TABLE_NAME, "parent_enabled")) {
            jdbcTemplate.execute(
                    "ALTER TABLE app_student_dashboard_widgets "
                            + "ADD COLUMN parent_enabled TINYINT(1) NOT NULL DEFAULT 1");
        }

        if (columnExists(TABLE_NAME, "enabled")) {
            jdbcTemplate.execute(
                    "UPDATE app_student_dashboard_widgets "
                            + "SET student_enabled = enabled, parent_enabled = enabled "
                            + "WHERE enabled IS NOT NULL");
            jdbcTemplate.execute("ALTER TABLE app_student_dashboard_widgets DROP COLUMN enabled");
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.TABLES "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                Integer.class,
                tableName);
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName);
        return count != null && count > 0;
    }
}
