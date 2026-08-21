package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.FrontCmsSetting;
import com.kantechsolution.smart_school.repository.FrontCmsSettingRepository;
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
@Order(33)
public class FrontCmsSettingService implements ApplicationRunner {

    static final Set<String> THEMES = Set.of(
            "default", "yellow", "darkgray", "bold_blue", "shadow_white", "material_pink"
    );

    private static final Map<String, Map<String, String>> PALETTES = palettes();

    private static final String DEFAULT_ANALYTICS = """
            <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
            <script>
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());

             gtag('config', 'GA_TRACKING_ID');
            </script>""";

    private final FrontCmsSettingRepository repository;
    private final UploadStorage uploadStorage;
    private final SchoolBackendThemeSettingService backendThemeSettingService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        requireSetting();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSetting() {
        return toMap(requireSetting());
    }

    @Transactional
    public Map<String, Object> save(Map<String, String> payload, MultipartFile logo, MultipartFile favicon) {
        FrontCmsSetting row = requireSetting();
        row.setFrontCmsEnabled(bool(payload.get("frontCmsEnabled")));
        row.setSidebarEnabled(bool(payload.get("sidebarEnabled")));
        row.setLanguageRtl(bool(payload.get("languageRtl")));
        row.setSidebarNews(bool(payload.get("sidebarNews")));
        row.setSidebarComplain(bool(payload.get("sidebarComplain")));
        row.setLanguage(language(payload.get("language")));
        row.setFooterText(text(payload.get("footerText")));
        row.setCookieConsent(text(payload.get("cookieConsent")));
        row.setGoogleAnalytics(payload.get("googleAnalytics") == null ? "" : payload.get("googleAnalytics"));
        row.setWhatsappUrl(text(payload.get("whatsappUrl")));
        row.setFacebookUrl(text(payload.get("facebookUrl")));
        row.setTwitterUrl(text(payload.get("twitterUrl")));
        row.setYoutubeUrl(text(payload.get("youtubeUrl")));
        row.setGooglePlusUrl(text(payload.get("googlePlusUrl")));
        row.setLinkedinUrl(text(payload.get("linkedinUrl")));
        row.setInstagramUrl(text(payload.get("instagramUrl")));
        row.setPinterestUrl(text(payload.get("pinterestUrl")));
        row.setCurrentTheme(theme(payload.get("currentTheme")));
        if (logo != null && !logo.isEmpty()) {
            row.setLogoPath(storeImage(logo, "logo"));
        }
        if (favicon != null && !favicon.isEmpty()) {
            row.setFaviconPath(storeImage(favicon, "favicon"));
        }
        FrontCmsSetting saved = repository.save(row);
        applyAppTheme(saved.getCurrentTheme());
        return toMap(saved);
    }

    private FrontCmsSetting requireSetting() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            FrontCmsSetting row = FrontCmsSetting.builder()
                    .frontCmsEnabled(true)
                    .sidebarEnabled(false)
                    .languageRtl(false)
                    .sidebarNews(true)
                    .sidebarComplain(true)
                    .language("English")
                    .footerText("© Mount Carmel School 2025 All rights reserve")
                    .cookieConsent("")
                    .googleAnalytics(DEFAULT_ANALYTICS)
                    .whatsappUrl("https://www.whatsapp.com/a")
                    .facebookUrl("https://www.facebook.com/a")
                    .twitterUrl("https://twitter.com/a")
                    .youtubeUrl("https://www.youtube.com/a")
                    .googlePlusUrl("https://plus.google.com/a")
                    .linkedinUrl("https://www.linkedin.com/a")
                    .instagramUrl("https://www.instagram.com/a")
                    .pinterestUrl("https://in.pinterest.com/a")
                    .currentTheme("material_pink")
                    .build();
            row.setIsActive(true);
            return repository.save(row);
        });
    }

    private String storeImage(MultipartFile file, String prefix) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        try {
            Path directory = uploadStorage.getFrontCmsDir();
            Files.createDirectories(directory);
            String original = file.getOriginalFilename();
            String extension = original != null && original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".png";
            String filename = prefix + "-" + UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), directory.resolve(filename));
            return "/uploads/front-cms/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store image");
        }
    }

    private Map<String, Object> toMap(FrontCmsSetting row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("frontCmsEnabled", Boolean.TRUE.equals(row.getFrontCmsEnabled()));
        map.put("sidebarEnabled", Boolean.TRUE.equals(row.getSidebarEnabled()));
        map.put("languageRtl", Boolean.TRUE.equals(row.getLanguageRtl()));
        map.put("sidebarNews", Boolean.TRUE.equals(row.getSidebarNews()));
        map.put("sidebarComplain", Boolean.TRUE.equals(row.getSidebarComplain()));
        map.put("language", row.getLanguage());
        map.put("logo", row.getLogoPath() == null ? "" : row.getLogoPath());
        map.put("favicon", row.getFaviconPath() == null ? "" : row.getFaviconPath());
        map.put("footerText", row.getFooterText() == null ? "" : row.getFooterText());
        map.put("cookieConsent", row.getCookieConsent() == null ? "" : row.getCookieConsent());
        map.put("googleAnalytics", row.getGoogleAnalytics() == null ? "" : row.getGoogleAnalytics());
        map.put("whatsappUrl", row.getWhatsappUrl() == null ? "" : row.getWhatsappUrl());
        map.put("facebookUrl", row.getFacebookUrl() == null ? "" : row.getFacebookUrl());
        map.put("twitterUrl", row.getTwitterUrl() == null ? "" : row.getTwitterUrl());
        map.put("youtubeUrl", row.getYoutubeUrl() == null ? "" : row.getYoutubeUrl());
        map.put("googlePlusUrl", row.getGooglePlusUrl() == null ? "" : row.getGooglePlusUrl());
        map.put("linkedinUrl", row.getLinkedinUrl() == null ? "" : row.getLinkedinUrl());
        map.put("instagramUrl", row.getInstagramUrl() == null ? "" : row.getInstagramUrl());
        map.put("pinterestUrl", row.getPinterestUrl() == null ? "" : row.getPinterestUrl());
        map.put("currentTheme", row.getCurrentTheme());
        map.put("palettes", PALETTES);
        map.put("theme", PALETTES.getOrDefault(row.getCurrentTheme(), PALETTES.get("material_pink")));
        return map;
    }

    private void applyAppTheme(String themeName) {
        Map<String, String> palette = PALETTES.get(theme(themeName));
        if (palette != null) {
            backendThemeSettingService.applyFrontCmsTheme(palette);
        }
    }

    private static Map<String, Map<String, String>> palettes() {
        Map<String, Map<String, String>> map = new LinkedHashMap<>();
        map.put("default", palette("#0d9488", "light", "shadow"));
        map.put("yellow", palette("#ca8a04", "light", "shadow"));
        map.put("darkgray", palette("#4b5563", "dark", "shadow"));
        map.put("bold_blue", palette("#2563eb", "light", "shadow"));
        map.put("shadow_white", palette("#64748b", "light", "shadow"));
        map.put("material_pink", palette("#db2777", "light", "shadow"));
        return map;
    }

    private static Map<String, String> palette(String primaryColor, String themeMode, String skin) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("primaryColor", primaryColor);
        map.put("themeMode", themeMode);
        map.put("skin", skin);
        return map;
    }

    private static String theme(String value) {
        String text = text(value);
        return THEMES.contains(text) ? text : "material_pink";
    }

    private static String language(String value) {
        String text = text(value);
        return text.isEmpty() ? "English" : text;
    }

    private static boolean bool(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        String text = text(value).toLowerCase();
        return "true".equals(text) || "1".equals(text) || "on".equals(text) || "yes".equals(text);
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
