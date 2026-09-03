package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.DatabaseBootstrapProperties;
import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.BackupFile;
import com.kantechsolution.smart_school.repository.BackupFileRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.time.Instant;
import java.util.List;

/**
 * Restores the bundled SQL backup before any other seeders run so the database
 * is populated with real operational data (211 tables, 178+ with rows).
 */
@Service
@RequiredArgsConstructor
@Order(Integer.MIN_VALUE)
public class DatabaseBootstrapService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseBootstrapService.class);
    private static final String MARKER_FILE = ".database-bootstrapped";

    private final DatabaseBootstrapProperties properties;
    private final UploadStorage uploadStorage;
    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    private final BackupFileRepository backupFileRepository;

    @Override
    public void run(ApplicationArguments args) throws IOException {
        if (properties.isOff()) {
            return;
        }

        Path marker = uploadStorage.getRoot().resolve(MARKER_FILE);
        if (!properties.isForce() && Files.exists(marker)) {
            log.info("Database bootstrap skipped (already completed). Set app.database.bootstrap-from-backup=force to re-import.");
            return;
        }

        if (!properties.isForce() && !needsBootstrap()) {
            log.info("Database already populated; bootstrap skipped.");
            if (!Files.exists(marker)) {
                Files.writeString(marker, "skipped-existing-data:" + Instant.now());
            }
            return;
        }

        if (properties.isBootstrapIfIncomplete() && !properties.isForce() && hasExistingSchoolData()) {
            log.warn("Database is incomplete (too many empty tables). Restoring bundled backup.");
        }

        Path backupPath = resolveBackupPath();
        if (!Files.exists(backupPath)) {
            log.warn("Bootstrap backup not found at {} – skipping restore.", backupPath);
            return;
        }

        log.warn("Restoring database from {}. This replaces all existing table data.", backupPath.getFileName());
        restoreBackup(backupPath);
        registerBackupFile(backupPath);
        Files.writeString(marker, "restored:" + Instant.now());
        log.info("Database bootstrap completed successfully.");
    }

    private boolean needsBootstrap() {
        try {
            if (isDatabaseIncomplete()) {
                return true;
            }
            Integer feeGroups = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM fee_groups", Integer.class);
            Integer staffMembers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM staff_members", Integer.class);
            boolean sparseFees = feeGroups == null || feeGroups == 0;
            boolean sparseStaff = staffMembers == null || staffMembers < 5;
            return sparseFees || sparseStaff;
        } catch (DataAccessException ex) {
            return true;
        }
    }

    private boolean isDatabaseIncomplete() {
        if (!properties.isBootstrapIfIncomplete()) {
            return false;
        }
        try {
            List<String> tables = jdbcTemplate.queryForList(
                    "SELECT table_name FROM information_schema.tables "
                            + "WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'",
                    String.class
            );
            if (tables.isEmpty()) {
                return true;
            }
            int empty = 0;
            for (String table : tables) {
                if (tableCount(table) == 0) {
                    empty++;
                }
            }
            int threshold = Math.max(1, properties.getIncompleteTableThresholdPercent());
            int emptyPercent = (empty * 100) / tables.size();
            if (emptyPercent >= threshold) {
                log.info("Database incomplete: {}/{} tables empty ({}%, threshold {}%)",
                        empty, tables.size(), emptyPercent, threshold);
                return true;
            }
            return false;
        } catch (DataAccessException ex) {
            return true;
        }
    }

    private boolean hasExistingSchoolData() {
        try {
            Integer staffMembers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM staff_members", Integer.class);
            return staffMembers != null && staffMembers > 0;
        } catch (DataAccessException ex) {
            return false;
        }
    }

    private int tableCount(String table) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + table + "`", Integer.class);
        return value == null ? 0 : value;
    }

    private Path resolveBackupPath() {
        String fileName = properties.getBootstrapBackupFile();
        if (fileName == null || fileName.isBlank()) {
            fileName = "db_ver_7.1.0_2026-08-21_12-25-41.sql";
        }
        fileName = Path.of(fileName.trim()).getFileName().toString();
        Path dir = uploadStorage.getBackupsDir().toAbsolutePath().normalize();
        Path path = dir.resolve(fileName).normalize();
        if (!path.startsWith(dir)) {
            throw new IllegalStateException("Invalid bootstrap backup file name");
        }
        return path;
    }

    private void restoreBackup(Path backupPath) {
        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(
                    connection,
                    new EncodedResource(new FileSystemResource(backupPath.toFile()), StandardCharsets.UTF_8)
            );
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to restore bootstrap backup: " + ex.getMessage(), ex);
        }
    }

    private void registerBackupFile(Path backupPath) throws IOException {
        String fileName = backupPath.getFileName().toString();
        if (backupFileRepository.existsByFileName(fileName)) {
            return;
        }
        BackupFile backup = BackupFile.builder()
                .fileName(fileName)
                .fileSize(Files.size(backupPath))
                .build();
        backup.setIsActive(true);
        backupFileRepository.save(backup);
    }
}
