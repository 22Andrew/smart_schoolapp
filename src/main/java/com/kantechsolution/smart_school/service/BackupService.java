package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.BackupFile;
import com.kantechsolution.smart_school.model.BackupSetting;
import com.kantechsolution.smart_school.repository.BackupFileRepository;
import com.kantechsolution.smart_school.repository.BackupSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.ResultSetMetaData;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Order(35)
public class BackupService implements ApplicationRunner {

    private static final DateTimeFormatter FILE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    private final BackupSettingRepository settingRepository;
    private final BackupFileRepository fileRepository;
    private final UploadStorage uploadStorage;
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        requireSetting();
        try {
            Files.createDirectories(uploadStorage.getBackupsDir());
        } catch (IOException e) {
            throw new IllegalStateException("Could not create backups directory", e);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("cronSecretKey", requireSetting().getCronSecretKey());
        map.put("files", listFiles());
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listFiles() {
        return fileRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toFileMap).toList();
    }

    @Transactional
    public Map<String, Object> regenerateCronKey() {
        BackupSetting setting = requireSetting();
        setting.setCronSecretKey(newSecret());
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("cronSecretKey", settingRepository.save(setting).getCronSecretKey());
        return map;
    }

    public Map<String, Object> createBackup() {
        String fileName = "db_ver_7.1.0_" + LocalDateTime.now().format(FILE_TIME) + ".sql";
        Path path = resolveBackupPath(fileName);
        try {
            writeDump(path);
            return saveRecord(fileName, Files.size(path));
        } catch (Exception e) {
            deleteQuietly(path);
            throw new IllegalStateException("Failed to create backup: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> uploadBackup(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a SQL backup file");
        }
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().trim();
        String fileName = Path.of(original).getFileName().toString();
        if (!fileName.toLowerCase().endsWith(".sql") || !fileName.matches("[A-Za-z0-9._-]+")) {
            throw new IllegalArgumentException("Only .sql backup files are allowed");
        }
        if (fileRepository.existsByFileName(fileName)) {
            String stamp = LocalDateTime.now().format(FILE_TIME);
            fileName = fileName.substring(0, fileName.length() - 4) + "_" + stamp + ".sql";
        }
        Path path = resolveBackupPath(fileName);
        try {
            Files.createDirectories(path.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, path);
            }
            return saveRecord(fileName, Files.size(path));
        } catch (IOException e) {
            deleteQuietly(path);
            throw new IllegalStateException("Failed to upload backup: " + e.getMessage(), e);
        }
    }

    public void restore(Long id) {
        BackupFile backup = requireFile(id);
        Path path = resolveBackupPath(backup.getFileName());
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Backup file is missing on disk");
        }
        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(
                    connection,
                    new EncodedResource(new FileSystemResource(path.toFile()), StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to restore backup: " + e.getMessage(), e);
        }
    }

    public void deleteBackup(Long id) {
        BackupFile backup = requireFile(id);
        deleteQuietly(resolveBackupPath(backup.getFileName()));
        fileRepository.delete(backup);
    }

    public Path downloadPath(Long id) {
        BackupFile backup = requireFile(id);
        Path path = resolveBackupPath(backup.getFileName());
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Backup file is missing on disk");
        }
        return path;
    }

    public String downloadName(Long id) {
        return requireFile(id).getFileName();
    }

    private Map<String, Object> saveRecord(String fileName, long size) {
        BackupFile backup = BackupFile.builder()
                .fileName(fileName)
                .fileSize(size)
                .build();
        backup.setIsActive(true);
        return toFileMap(fileRepository.save(backup));
    }

    private void writeDump(Path path) throws IOException {
        Files.createDirectories(path.getParent());
        List<String> tables = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME FROM information_schema.TABLES "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' "
                        + "ORDER BY TABLE_NAME",
                String.class
        );

        try (BufferedWriter out = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
            out.write("-- Smart School database backup\n");
            out.write("SET NAMES utf8mb4;\n");
            out.write("SET FOREIGN_KEY_CHECKS=0;\n\n");

            for (String table : tables) {
                Map<String, Object> createRow = jdbcTemplate.queryForMap("SHOW CREATE TABLE `" + table + "`");
                Object ddl = createRow.get("Create Table");
                if (ddl == null) {
                    ddl = createRow.values().stream().skip(1).findFirst().orElse("");
                }
                out.write("DROP TABLE IF EXISTS `" + table + "`;\n");
                out.write(String.valueOf(ddl));
                out.write(";\n\n");

                jdbcTemplate.query("SELECT * FROM `" + table + "`", rs -> {
                    try {
                        ResultSetMetaData meta = rs.getMetaData();
                        int cols = meta.getColumnCount();
                        StringBuilder row = new StringBuilder();
                        row.append("INSERT INTO `").append(table).append("` VALUES (");
                        for (int i = 1; i <= cols; i++) {
                            if (i > 1) {
                                row.append(",");
                            }
                            row.append(sqlLiteral(rs.getObject(i)));
                        }
                        row.append(");\n");
                        out.write(row.toString());
                    } catch (IOException e) {
                        throw new UncheckedIOException(e);
                    }
                });
                out.write("\n");
            }

            out.write("SET FOREIGN_KEY_CHECKS=1;\n");
        }
    }

    private BackupSetting requireSetting() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() -> {
            BackupSetting setting = BackupSetting.builder()
                    .cronSecretKey(newSecret())
                    .build();
            setting.setIsActive(true);
            return settingRepository.save(setting);
        });
    }

    private BackupFile requireFile(Long id) {
        return fileRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Backup not found"));
    }

    private Path resolveBackupPath(String fileName) {
        Path dir = uploadStorage.getBackupsDir().toAbsolutePath().normalize();
        Path path = dir.resolve(fileName).normalize();
        if (!path.startsWith(dir) || !fileName.matches("[A-Za-z0-9._-]+")) {
            throw new IllegalArgumentException("Invalid backup file name");
        }
        return path;
    }

    private Map<String, Object> toFileMap(BackupFile backup) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", backup.getId());
        map.put("fileName", backup.getFileName());
        map.put("fileSize", backup.getFileSize() == null ? 0 : backup.getFileSize());
        map.put("createdAt", backup.getCreatedAt() == null ? "" : backup.getCreatedAt().toString());
        return map;
    }

    private static String newSecret() {
        return UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }

    private static String sqlLiteral(Object value) {
        if (value == null) {
            return "NULL";
        }
        if (value instanceof Boolean bool) {
            return bool ? "1" : "0";
        }
        if (value instanceof Number) {
            return value.toString();
        }
        if (value instanceof byte[] bytes) {
            return "0x" + HexFormat.of().formatHex(bytes);
        }
        if (value instanceof Timestamp ts) {
            return "'" + ts.toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS")) + "'";
        }
        if (value instanceof LocalDateTime dt) {
            return "'" + dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "'";
        }
        if (value instanceof LocalDate date) {
            return "'" + date + "'";
        }
        if (value instanceof LocalTime time) {
            return "'" + time + "'";
        }
        String text = value.toString().replace("\\", "\\\\").replace("'", "''");
        return "'" + text + "'";
    }

    private static void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // best effort cleanup
        }
    }
}
