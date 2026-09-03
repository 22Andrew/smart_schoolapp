package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SchoolBackendThemeSetting;
import com.kantechsolution.smart_school.repository.FrontCmsSettingRepository;
import com.kantechsolution.smart_school.repository.SchoolBackendThemeSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SchoolBackendThemeSettingService implements ApplicationRunner {

    private static final Set<String> THEME_MODES = Set.of("light", "dark");
    private static final Set<String> SKINS = Set.of("shadow", "bordered");
    private static final Set<String> SIDE_MENU_STYLES = Set.of("default", "compact");
    private static final Set<String> BOX_CONTENTS = Set.of("compact", "wide");
    private static final List<String> PRESET_COLORS = List.of(
            "#8b5cf6", "#38bdf8", "#f97316", "#14b8a6", "#ec4899"
    );

    private final SchoolBackendThemeSettingRepository repository;
    private final FrontCmsSettingRepository frontCmsSettingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedDefaults();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return toMap(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> payload) {
        SchoolBackendThemeSetting settings = requireSettings();
        settings.setThemeMode(requiredOption(payload.get("themeMode"), THEME_MODES, "Theme mode"));
        settings.setSkin(requiredOption(payload.get("skin"), SKINS, "Skin"));
        settings.setSideMenuStyle(requiredOption(payload.get("sideMenuStyle"), SIDE_MENU_STYLES, "Side menu style"));
        settings.setPrimaryColor(requiredColor(payload.get("primaryColor")));
        settings.setBoxContent(requiredOption(payload.get("boxContent"), BOX_CONTENTS, "Box content"));
        return toMap(repository.save(settings));
    }

    @Transactional
    public Map<String, Object> applyFrontCmsTheme(Map<String, String> palette) {
        if (palette == null || palette.isEmpty()) {
            return getSettings();
        }
        SchoolBackendThemeSetting settings = requireSettings();
        settings.setPrimaryColor(requiredColor(palette.get("primaryColor")));
        settings.setThemeMode(requiredOption(palette.get("themeMode"), THEME_MODES, "Theme mode"));
        String skin = text(palette.get("skin"));
        if (SKINS.contains(skin)) {
            settings.setSkin(skin);
        }
        return toMap(repository.save(settings));
    }

    private void seedDefaults() {
        SchoolBackendThemeSetting settings = SchoolBackendThemeSetting.builder()
                .themeMode("dark")
                .skin("shadow")
                .sideMenuStyle("default")
                .primaryColor("#8b5cf6")
                .boxContent("wide")
                .build();
        settings.setIsActive(true);
        repository.save(settings);
    }

    private SchoolBackendThemeSetting requireSettings() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            seedDefaults();
            return repository.findAll().stream().findFirst().orElseThrow();
        });
    }

    private Map<String, Object> toMap(SchoolBackendThemeSetting settings) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", settings.getId());
        map.put("themeMode", settings.getThemeMode());
        map.put("skin", settings.getSkin());
        map.put("sideMenuStyle", settings.getSideMenuStyle());
        map.put("primaryColor", settings.getPrimaryColor());
        map.put("boxContent", settings.getBoxContent());
        map.put("presetColors", PRESET_COLORS);
        frontCmsSettingRepository.findAll().stream().findFirst()
                .map(row -> row.getCurrentTheme())
                .filter(name -> name != null && !name.isBlank())
                .ifPresent(name -> map.put("frontCmsTheme", name));
        return map;
    }

    private String requiredOption(Object value, Set<String> allowed, String label) {
        String text = text(value);
        if (!allowed.contains(text)) {
            throw new IllegalArgumentException(label + " is invalid");
        }
        return text;
    }

    private String requiredColor(Object value) {
        String color = text(value);
        if (!color.matches("^#[0-9A-Fa-f]{6}$")) {
            throw new IllegalArgumentException("Primary color must be a valid hex color");
        }
        return color.toLowerCase();
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
