package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.PrintHeaderFooter;
import com.kantechsolution.smart_school.repository.PrintHeaderFooterRepository;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Order(31)
public class PrintHeaderFooterService implements ApplicationRunner {

    static final List<String> TYPES = List.of(
            "fees_receipt", "payslip", "online_admission", "online_exam", "email", "general"
    );

    private static final String DEFAULT_FOOTER =
            "This receipt is computer generated hence no signature is required.";
    private static final String DEFAULT_EMAIL_FOOTER =
            "Note: This email was sent from an email address that can't receive emails. Please don't reply to this email";

    private final PrintHeaderFooterRepository repository;
    private final UploadStorage uploadStorage;
    private final SchoolGeneralSettingService generalSettingService;
    private final SchoolLogoSettingService logoSettingService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        TYPES.forEach(type -> {
            PrintHeaderFooter row = requireType(type);
            if ("email".equals(type) && text(row.getFooterContent()).isEmpty()) {
                row.setFooterContent(DEFAULT_EMAIL_FOOTER);
                repository.save(row);
            }
        });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list() {
        Map<String, Object> documents = new LinkedHashMap<>();
        for (String type : TYPES) {
            documents.put(type, toMap(requireType(type)));
        }
        Map<String, Object> general = generalSettingService.getSettings();
        Map<String, Object> logos = logoSettingService.getSettings();
        Map<String, Object> school = new LinkedHashMap<>();
        school.put("schoolName", general.get("schoolName"));
        school.put("address", general.get("address"));
        school.put("phone", general.get("phone"));
        school.put("email", general.get("email"));
        school.put("website", website(general.get("baseUrl")));
        school.put("logo", logos.get("printLogo"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("documents", documents);
        response.put("school", school);
        return response;
    }

    @Transactional
    public Map<String, Object> save(String documentType, String footerContent, MultipartFile header, boolean removeHeader) {
        String type = text(documentType).toLowerCase();
        if (!TYPES.contains(type)) {
            throw new IllegalArgumentException("Unknown document type");
        }
        PrintHeaderFooter row = requireType(type);
        row.setFooterContent(footerContent == null ? "" : footerContent);
        if (removeHeader) {
            row.setHeaderImagePath(null);
        } else if (header != null && !header.isEmpty()) {
            String contentType = header.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }
            row.setHeaderImagePath(storeHeader(header));
        }
        repository.save(row);
        return list();
    }

    private PrintHeaderFooter requireType(String type) {
        return repository.findByDocumentType(type).orElseGet(() -> {
            PrintHeaderFooter row = PrintHeaderFooter.builder()
                    .documentType(type)
                    .footerContent(defaultFooter(type))
                    .build();
            row.setIsActive(true);
            return repository.save(row);
        });
    }

    private String storeHeader(MultipartFile file) {
        try {
            Path directory = uploadStorage.getPrintHeadersDir();
            Files.createDirectories(directory);
            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".png";
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), directory.resolve(filename));
            return "/uploads/print-headers/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store header image");
        }
    }

    private Map<String, Object> toMap(PrintHeaderFooter row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("headerImage", row.getHeaderImagePath() == null ? "" : row.getHeaderImagePath());
        map.put("footerContent", row.getFooterContent() == null ? "" : row.getFooterContent());
        return map;
    }

    private static String defaultFooter(String type) {
        if ("fees_receipt".equals(type)) {
            return DEFAULT_FOOTER;
        }
        if ("email".equals(type)) {
            return DEFAULT_EMAIL_FOOTER;
        }
        return "";
    }

    private static String website(Object value) {
        String text = text(value).replaceFirst("^https?://", "").replaceAll("/+$", "");
        return text.isEmpty() ? "" : text;
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
