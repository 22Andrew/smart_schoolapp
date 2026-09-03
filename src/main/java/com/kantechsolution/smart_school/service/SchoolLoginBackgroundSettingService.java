package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.SchoolLoginBackgroundSetting;
import com.kantechsolution.smart_school.repository.SchoolLoginBackgroundSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchoolLoginBackgroundSettingService implements ApplicationRunner {

    private static final Set<String> ALLOWED_TYPES = Set.of("admin", "user");

    private final SchoolLoginBackgroundSettingRepository repository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        if (repository.count() > 0) {
            return;
        }
        SchoolLoginBackgroundSetting settings = SchoolLoginBackgroundSetting.builder().build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> updateBackground(String type, MultipartFile file) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException("Invalid background type");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Background image is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        SchoolLoginBackgroundSetting settings = requireSettings();
        String savedPath = storeBackground(file);

        if ("admin".equals(type)) {
            settings.setAdminPanelBackgroundPath(savedPath);
        } else {
            settings.setUserPanelBackgroundPath(savedPath);
        }

        return toMap(repository.save(settings));
    }

    private SchoolLoginBackgroundSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            SchoolLoginBackgroundSetting settings = SchoolLoginBackgroundSetting.builder().build();
            settings.setIsActive(true);
            return repository.save(settings);
        });
    }

    private String storeBackground(MultipartFile file) {
        try {
            Path directory = uploadStorage.getLoginBackgroundsDir();
            Files.createDirectories(directory);

            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".jpg";
            String filename = UUID.randomUUID() + extension;
            Path target = directory.resolve(filename);
            Files.copy(file.getInputStream(), target);
            return "/uploads/login-backgrounds/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store background image");
        }
    }

    private Map<String, Object> toMap(SchoolLoginBackgroundSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("adminPanelBackground", blank(settings.getAdminPanelBackgroundPath()));
        map.put("userPanelBackground", blank(settings.getUserPanelBackgroundPath()));
        map.put("backgroundDimensions", "1460px X 1080px");
        return map;
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
