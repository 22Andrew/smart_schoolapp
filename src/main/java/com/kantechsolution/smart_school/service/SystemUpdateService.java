package com.kantechsolution.smart_school.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringBootVersion;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class SystemUpdateService {

    private final DataSource dataSource;

    @Value("${spring.application.name:smart_schoolapp}")
    private String applicationName;

    @Value("${app.version:0.0.1-SNAPSHOT}")
    private String appVersion;

    @Value("${app.database.bootstrap-backup-file:}")
    private String bootstrapBackupFile;

    public SystemUpdateService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Map<String, Object> overview() {
        Map<String, Object> info = new HashMap<>();
        info.put("applicationName", applicationName);
        info.put("appVersion", appVersion);
        info.put("springBootVersion", SpringBootVersion.getVersion());
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("javaVendor", System.getProperty("java.vendor"));
        info.put("osName", System.getProperty("os.name"));
        info.put("osVersion", System.getProperty("os.version"));
        info.put("serverTime", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.systemDefault())
                .format(Instant.now()));
        info.put("database", readDatabaseInfo());
        info.put("bootstrapBackupFile", bootstrapBackupFile == null ? "" : bootstrapBackupFile);
        return info;
    }

    private Map<String, String> readDatabaseInfo() {
        Map<String, String> db = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData meta = connection.getMetaData();
            db.put("productName", meta.getDatabaseProductName());
            db.put("productVersion", meta.getDatabaseProductVersion());
            db.put("driverName", meta.getDriverName());
            db.put("url", meta.getURL());
        } catch (Exception e) {
            db.put("productName", "Unavailable");
            db.put("productVersion", e.getMessage());
        }
        return db;
    }
}
