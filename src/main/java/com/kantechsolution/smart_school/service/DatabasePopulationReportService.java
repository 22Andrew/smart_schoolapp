package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Logs a post-startup summary of populated vs empty database tables so operators
 * can confirm the bundled backup and supplementary seeders filled every object.
 */
@Service
@RequiredArgsConstructor
@Order(101)
public class DatabasePopulationReportService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabasePopulationReportService.class);

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            List<String> tables = jdbcTemplate.queryForList(
                    "SELECT table_name FROM information_schema.tables "
                            + "WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' "
                            + "ORDER BY table_name",
                    String.class
            );
            if (tables.isEmpty()) {
                log.warn("Database population report: no tables found.");
                return;
            }

            List<String> emptyTables = new ArrayList<>();
            int populated = 0;
            for (String table : tables) {
                if (tableCount(table) == 0) {
                    emptyTables.add(table);
                } else {
                    populated++;
                }
            }

            log.info("Database population report: {}/{} tables have rows ({} empty).",
                    populated, tables.size(), emptyTables.size());
            if (!emptyTables.isEmpty() && emptyTables.size() <= 40) {
                log.info("Empty tables: {}", String.join(", ", emptyTables));
            } else if (!emptyTables.isEmpty()) {
                log.info("Empty tables (first 40): {} … and {} more",
                        String.join(", ", emptyTables.subList(0, 40)),
                        emptyTables.size() - 40);
            }
        } catch (DataAccessException ex) {
            log.warn("Database population report skipped: {}", ex.getMessage());
        }
    }

    private int tableCount(String table) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + table + "`", Integer.class);
        return value == null ? 0 : value;
    }
}
