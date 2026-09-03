package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.AppAddon;
import com.kantechsolution.smart_school.repository.AppAddonRepository;
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
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Order(38)
public class AppAddonService implements ApplicationRunner {

    private static final String[][] DEFAULTS = {
            {
                    "whatsapp-messaging",
                    "Smart School Whatsapp Messaging",
                    "1.0",
                    "Smart School Whatsapp Messaging module is a unique module that allows you to communicate with your customers directly through Whatsapp.",
                    "whatsapp"
            },
            {
                    "thermal-print",
                    "Smart School Thermal Print",
                    "2.0",
                    "Smart School Thermal Printer module allows to setup your thermal printer to print receipt through thermal printer. Smart School Thermal Printer is compatible with all types of thermal receipt printers.",
                    "thermal"
            },
            {
                    "quick-fees-create",
                    "Smart School Quick Fees Create",
                    "2.0",
                    "Smart School Quick Fees Create module allows you to add one click fees create option on student profile page. Smart School Quick Fees Create module allows you to add any fees and receive fees payment through student profile page.",
                    "fees"
            },
            {
                    "qr-attendance",
                    "Smart School QR Code Attendance",
                    "3.0",
                    "Smart School QR Attendance module allows you to receive auto attendance through QR / Barcode scan with mobile application. Smart School QR Attendance module allows you to scan student attendance through mobile QR / Barcode scanner.",
                    "qr"
            },
            {
                    "cbse-examination",
                    "Smart School CBSE Examination",
                    "4.0",
                    "Smart School CBSE Examination module allows to you conduct CBE Examination in your institute. Smart School CBSE Examination module allows add exam, exam schedule, exam grade, assign / view student marks and generate marksheet reports.",
                    "cbse"
            },
            {
                    "two-factor-auth",
                    "Smart School Two Factor Authentication",
                    "4.0",
                    "Smart School Two Factor Authentication module allows you secure your admin login with multi factor login authentication. Smart School Two Factor Authentication module will add additional login protection on your Smart School user login.",
                    "twofa"
            },
            {
                    "multi-branch",
                    "Smart School Multi Branch",
                    "4.0",
                    "Smart School Multi Branch module allows you to add and manage multiple school / institution branches with one Smart School admin panel. Smart School Multi Branch module is helpful for you to manage multiple school branches with one super admin login.",
                    "branch"
            },
            {
                    "behaviour-records",
                    "Smart School Behaviour Records",
                    "4.0",
                    "Smart School Behaviour Records module allows you to add student behaviour records with incident details, assign points with positive / negative incident type. Behaviour Records module allows you to assign student with particular incident with incident details.",
                    "behaviour"
            },
            {
                    "online-course",
                    "Smart School Online Course",
                    "5.0",
                    "Smart School Online Course module allows you to create and sale online course with online course creation option on Smart School admin panel. Using Smart School Online Course module, your admin can create course, course sections, course lessons and online exams with course online payments to super admin.",
                    "course"
            }
    };

    private final AppAddonRepository repository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        for (String[] row : DEFAULTS) {
            repository.save(AppAddon.builder()
                    .slug(row[0])
                    .name(row[1])
                    .version(row[2])
                    .description(row[3])
                    .iconKey(row[4])
                    .isInstalled(true)
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listInstalled() {
        return repository.findAllByIsInstalledTrueOrderByNameAsc().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> upload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an addon file to upload");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }
        String lower = originalName.toLowerCase();
        if (!lower.endsWith(".zip")) {
            throw new IllegalArgumentException("Only .zip addon files are supported");
        }

        String slug = slugFromFileName(originalName);
        String storedName = UUID.randomUUID() + "-" + sanitizeFileName(originalName);
        Path target = uploadStorage.getAddonsDir().resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        AppAddon addon = repository.findBySlug(slug).orElseGet(() -> AppAddon.builder()
                .slug(slug)
                .iconKey("custom")
                .build());
        addon.setName(humanNameFromSlug(slug));
        addon.setVersion("1.0");
        addon.setDescription("Custom addon uploaded from local directory.");
        addon.setFileName(storedName);
        addon.setIsInstalled(true);
        addon.setIsActive(true);
        return toMap(repository.save(addon));
    }

    @Transactional
    public void uninstall(Long id) {
        AppAddon addon = requireAddon(id);
        if (addon.getFileName() != null && !addon.getFileName().isBlank()) {
            Path path = uploadStorage.getAddonsDir().resolve(addon.getFileName());
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
                /* ignore missing file */
            }
        }
        addon.setIsInstalled(false);
        addon.setIsActive(false);
        repository.save(addon);
    }

    private AppAddon requireAddon(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Addon not found"));
    }

    private Map<String, Object> toMap(AppAddon addon) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", addon.getId());
        map.put("slug", addon.getSlug());
        map.put("name", addon.getName());
        map.put("version", addon.getVersion());
        map.put("description", addon.getDescription());
        map.put("iconKey", addon.getIconKey());
        map.put("isInstalled", Boolean.TRUE.equals(addon.getIsInstalled()));
        map.put("fileName", addon.getFileName());
        return map;
    }

    private static String slugFromFileName(String fileName) {
        String base = fileName.replaceAll("(?i)\\.zip$", "").trim().toLowerCase();
        base = base.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (base.isBlank()) {
            base = "custom-addon";
        }
        return base;
    }

    private static String humanNameFromSlug(String slug) {
        String[] parts = slug.split("-");
        StringBuilder builder = new StringBuilder("Smart School ");
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            builder.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) {
                builder.append(part.substring(1));
            }
            builder.append(' ');
        }
        return builder.toString().trim();
    }

    private static String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
