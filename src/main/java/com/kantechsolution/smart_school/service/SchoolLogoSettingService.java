package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.SchoolLogoSetting;
import com.kantechsolution.smart_school.repository.SchoolLogoSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
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
@Order(4)
public class SchoolLogoSettingService implements ApplicationRunner {

    private static final Set<String> ALLOWED_TYPES = Set.of("print", "admin", "adminSmall", "app");

    private final SchoolLogoSettingRepository repository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        if (repository.count() > 0) {
            return;
        }
        SchoolLogoSetting settings = SchoolLogoSetting.builder().build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> updateLogo(String type, MultipartFile file) {
        if (!ALLOWED_TYPES.contains(type)) {
            throw new IllegalArgumentException("Invalid logo type");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Logo file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        SchoolLogoSetting settings = requireSettings();
        String savedPath = storeLogo(file);

        switch (type) {
            case "print" -> settings.setPrintLogoPath(savedPath);
            case "admin" -> settings.setAdminLogoPath(savedPath);
            case "adminSmall" -> settings.setAdminSmallLogoPath(savedPath);
            case "app" -> settings.setAppLogoPath(savedPath);
            default -> throw new IllegalArgumentException("Invalid logo type");
        }

        return toMap(repository.save(settings));
    }

    private SchoolLogoSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            SchoolLogoSetting settings = SchoolLogoSetting.builder().build();
            settings.setIsActive(true);
            return repository.save(settings);
        });
    }

    private String storeLogo(MultipartFile file) {
        try {
            Path directory = uploadStorage.getLogosDir();
            Files.createDirectories(directory);

            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".png";
            String filename = UUID.randomUUID() + extension;
            Path target = directory.resolve(filename);
            Files.copy(file.getInputStream(), target);
            return "/uploads/logos/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store logo file");
        }
    }

    private Map<String, Object> toMap(SchoolLogoSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("printLogo", blank(settings.getPrintLogoPath()));
        map.put("adminLogo", blank(settings.getAdminLogoPath()));
        map.put("adminSmallLogo", blank(settings.getAdminSmallLogoPath()));
        map.put("appLogo", blank(settings.getAppLogoPath()));
        map.put("printLogoDimensions", "170px X 184px");
        map.put("adminLogoDimensions", "290px X 51px");
        map.put("adminSmallLogoDimensions", "32px X 32px");
        map.put("appLogoDimensions", "290px X 51px");
        return map;
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
