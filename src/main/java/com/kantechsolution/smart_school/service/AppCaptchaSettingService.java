package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppCaptchaSetting;
import com.kantechsolution.smart_school.repository.AppCaptchaSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Order(41)
public class AppCaptchaSettingService implements ApplicationRunner {

    private static final String[][] DEFAULT_SETTINGS = {
            {"userlogin", "User login", "false"},
            {"login", "Login", "false"},
            {"admission", "Admission", "false"},
            {"complain", "Complain", "false"},
            {"contact_us", "Contact Us", "false"},
            {"guest_login_signup", "Guest login and signup", "false"}
    };

    private final AppCaptchaSettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        syncDefaults();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return repository.findAllByOrderBySortOrderAscDisplayNameAsc().stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> setEnabled(String slug, boolean enabled) {
        AppCaptchaSetting setting = repository.findBySlug(normalizeSlug(slug))
                .orElseThrow(() -> new IllegalArgumentException("Captcha setting not found"));
        setting.setEnabled(enabled);
        return toMap(repository.save(setting));
    }

    private void syncDefaults() {
        Map<String, AppCaptchaSetting> existingBySlug = new LinkedHashMap<>();
        repository.findAllByOrderBySortOrderAscDisplayNameAsc()
                .forEach(item -> existingBySlug.putIfAbsent(item.getSlug(), item));

        Set<String> canonicalSlugs = new HashSet<>();
        for (int i = 0; i < DEFAULT_SETTINGS.length; i++) {
            String[] row = DEFAULT_SETTINGS[i];
            String slug = row[0];
            canonicalSlugs.add(slug);
            AppCaptchaSetting setting = existingBySlug.get(slug);
            if (setting == null) {
                setting = AppCaptchaSetting.builder()
                        .slug(slug)
                        .displayName(row[1])
                        .enabled(Boolean.parseBoolean(row[2]))
                        .sortOrder(i + 1)
                        .build();
                setting.setIsActive(true);
                repository.save(setting);
            } else {
                setting.setDisplayName(row[1]);
                setting.setSortOrder(i + 1);
                if (setting.getEnabled() == null) {
                    setting.setEnabled(Boolean.parseBoolean(row[2]));
                }
                repository.save(setting);
            }
        }

        existingBySlug.values().stream()
                .filter(item -> !canonicalSlugs.contains(item.getSlug()))
                .forEach(item -> repository.deleteById(item.getId()));
    }

    private Map<String, Object> toMap(AppCaptchaSetting setting) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", setting.getId());
        map.put("slug", setting.getSlug());
        map.put("name", setting.getDisplayName());
        map.put("enabled", Boolean.TRUE.equals(setting.getEnabled()));
        map.put("sortOrder", setting.getSortOrder());
        return map;
    }

    private String normalizeSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("Captcha setting name is required");
        }
        return slug.trim();
    }
}
