package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping({"/admin/backup", "/admin/backup/", "/admin/backup/index"})
    public String page() {
        return "backup";
    }

    @GetMapping("/api/backup")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> overview() {
        return ResponseEntity.ok(backupService.overview());
    }

    @PostMapping("/api/backup/create")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> create() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = backupService.createBackup();
            response.put("success", true);
            response.put("message", "Backup created successfully!");
            response.put("data", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping(value = "/api/backup/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = backupService.uploadBackup(file);
            response.put("success", true);
            response.put("message", "Backup uploaded successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/backup/{id}/restore")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> restore(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            backupService.restore(id);
            response.put("success", true);
            response.put("message", "Database restored successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/backup/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            backupService.deleteBackup(id);
            response.put("success", true);
            response.put("message", "Backup deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/backup/cron-key")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> regenerateKey() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> saved = backupService.regenerateCronKey();
            response.put("success", true);
            response.put("message", "Cron secret key saved successfully!");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/api/backup/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        try {
            Path path = backupService.downloadPath(id);
            String fileName = backupService.downloadName(id);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(Files.size(path))
                    .body(new FileSystemResource(path.toFile()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
