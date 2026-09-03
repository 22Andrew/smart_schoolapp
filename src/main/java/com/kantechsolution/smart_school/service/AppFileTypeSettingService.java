package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppFileTypeSetting;
import com.kantechsolution.smart_school.repository.AppFileTypeSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(45)
public class AppFileTypeSettingService implements ApplicationRunner {

    private static final String DEFAULT_FILE_EXTENSIONS =
            "pdf, zip, jpg, jpeg, png, txt, 7z, gif, csv, docx, mp3, mp4, accdb, odt, ods, ppt, pptx, xlsx, wmv, jfif, apk, ppt, bmp, jpe, mdb, rar, xls, svg, php, html";

    private static final String DEFAULT_FILE_MIME_TYPES =
            "application/pdf, image/zip, image/jpg, image/png, image/jpeg, text/plain, application/x-zip-compressed, application/zip, image/gif, text/csv, application/vnd.openxmlformats-officedocument.wordprocessingml.document, audio/mpeg, application/msaccess, application/vnd.oasis.opendocument.text, application/vnd.oasis.opendocument.spreadsheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, video/x-ms-wmv, video/mp4, image/jpeg, application/vnd.android.package-archive, application/x-msdownload, application/vnd.ms-powerpoint, image/bmp, image/jpeg, application/msaccess, application/vnd.ms-excel, image/svg+xml, image/php";

    private static final String DEFAULT_IMAGE_EXTENSIONS = "jfif, png, jpe, jpeg, jpg, bmp, gif, svg";

    private static final String DEFAULT_IMAGE_MIME_TYPES =
            "image/jpeg, image/png, image/jpeg, image/jpeg, image/bmp, image/gif, image/x-ms-bmp, image/svg+xml";

    private static final long DEFAULT_UPLOAD_SIZE = 100048576L;

    private final AppFileTypeSettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureSettings();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, String> payload) {
        AppFileTypeSetting settings = requireSettings();
        settings.setFileAllowedExtension(requiredText(payload.get("fileAllowedExtension"), "Allowed Extension"));
        settings.setFileAllowedMimeType(requiredText(payload.get("fileAllowedMimeType"), "Allowed MIME Type"));
        settings.setFileUploadSize(requiredSize(payload.get("fileUploadSize"), "Upload Size (In Bytes)"));
        settings.setImageAllowedExtension(requiredText(payload.get("imageAllowedExtension"), "Allowed Extension"));
        settings.setImageAllowedMimeType(requiredText(payload.get("imageAllowedMimeType"), "Allowed MIME Type"));
        settings.setImageUploadSize(requiredSize(payload.get("imageUploadSize"), "Upload Size (In Bytes)"));
        repository.save(settings);
        return toMap(settings);
    }

    private void ensureSettings() {
        if (repository.count() > 0) {
            return;
        }
        AppFileTypeSetting settings = new AppFileTypeSetting();
        settings.setFileAllowedExtension(DEFAULT_FILE_EXTENSIONS);
        settings.setFileAllowedMimeType(DEFAULT_FILE_MIME_TYPES);
        settings.setFileUploadSize(DEFAULT_UPLOAD_SIZE);
        settings.setImageAllowedExtension(DEFAULT_IMAGE_EXTENSIONS);
        settings.setImageAllowedMimeType(DEFAULT_IMAGE_MIME_TYPES);
        settings.setImageUploadSize(DEFAULT_UPLOAD_SIZE);
        settings.setIsActive(true);
        repository.save(settings);
    }

    private AppFileTypeSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            ensureSettings();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(AppFileTypeSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("fileAllowedExtension", settings.getFileAllowedExtension());
        map.put("fileAllowedMimeType", settings.getFileAllowedMimeType());
        map.put("fileUploadSize", settings.getFileUploadSize());
        map.put("imageAllowedExtension", settings.getImageAllowedExtension());
        map.put("imageAllowedMimeType", settings.getImageAllowedMimeType());
        map.put("imageUploadSize", settings.getImageUploadSize());
        return map;
    }

    private String requiredText(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }

    private long requiredSize(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        try {
            long size = Long.parseLong(value.trim());
            if (size <= 0) {
                throw new IllegalArgumentException(label + " must be greater than zero");
            }
            return size;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(label + " must be a valid number");
        }
    }
}
