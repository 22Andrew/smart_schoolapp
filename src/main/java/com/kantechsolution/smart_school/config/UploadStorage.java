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
}
