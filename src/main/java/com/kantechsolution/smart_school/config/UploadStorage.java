package com.kantechsolution.smart_school.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Shared upload directory used for saving and serving student photos.
 */
@Component
public class UploadStorage {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path root;

    @PostConstruct
    public void init() throws IOException {
        root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root.resolve("students"));
        Files.createDirectories(root.resolve("courses"));
        Files.createDirectories(root.resolve("lessons"));
        Files.createDirectories(root.resolve("certificates"));
        Files.createDirectories(root.resolve("admitcards"));
        Files.createDirectories(root.resolve("marksheets"));
        Files.createDirectories(root.resolve("leaves"));
        Files.createDirectories(root.resolve("staff"));
        Files.createDirectories(root.resolve("staff-documents"));
        Files.createDirectories(root.resolve("logos"));
        Files.createDirectories(root.resolve("login-backgrounds"));
        Files.createDirectories(root.resolve("notices"));
        Files.createDirectories(root.resolve("emails"));
        Files.createDirectories(root.resolve("contents"));
        Files.createDirectories(root.resolve("homework"));
        Files.createDirectories(root.resolve("inventory"));
        Files.createDirectories(root.resolve("vehicles"));
        Files.createDirectories(root.resolve("events"));
        Files.createDirectories(root.resolve("media"));
        Files.createDirectories(root.resolve("alumni"));
        Files.createDirectories(root.resolve("print-headers"));
        Files.createDirectories(root.resolve("front-cms"));
        Files.createDirectories(root.resolve("backups"));
        Files.createDirectories(root.resolve("addons"));
        Files.createDirectories(root.resolve("online-admission"));
    }

    public Path getRoot() {
        return root;
    }

    public Path getStudentsDir() {
        return root.resolve("students");
    }

    public Path getCoursesDir() {
        return root.resolve("courses");
    }

    public Path getLessonsDir() {
        return root.resolve("lessons");
    }

    public Path getCertificatesDir() {
        return root.resolve("certificates");
    }

    public Path getAdmitCardsDir() {
        return root.resolve("admitcards");
    }

    public Path getMarksheetsDir() {
        return root.resolve("marksheets");
    }

    public Path getLeavesDir() {
        return root.resolve("leaves");
    }

    public Path getStaffDir() {
        return root.resolve("staff");
    }

    public Path getStaffDocumentsDir() {
        return root.resolve("staff-documents");
    }

    public Path getLogosDir() {
        return root.resolve("logos");
    }

    public Path getLoginBackgroundsDir() {
        return root.resolve("login-backgrounds");
    }

    public Path getNoticesDir() {
        return root.resolve("notices");
    }

    public Path getEmailsDir() {
        return root.resolve("emails");
    }

    public Path getContentsDir() {
        return root.resolve("contents");
    }

    public Path getHomeworkDir() {
        return root.resolve("homework");
    }

    public Path getInventoryDir() {
        return root.resolve("inventory");
    }

    public Path getVehiclesDir() {
        return root.resolve("vehicles");
    }

    public Path getEventsDir() {
        return root.resolve("events");
    }

    public Path getMediaDir() {
        return root.resolve("media");
    }

    public Path getAlumniDir() {
        return root.resolve("alumni");
    }

    public Path getPrintHeadersDir() {
        return root.resolve("print-headers");
    }

    public Path getFrontCmsDir() {
        return root.resolve("front-cms");
    }

    public Path getBackupsDir() {
        return root.resolve("backups");
    }

    public Path getAddonsDir() {
        return root.resolve("addons");
    }

    public Path getOnlineAdmissionDir() {
        return root.resolve("online-admission");
    }
}
