package com.kantechsolution.smart_school.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@Slf4j
public class PhraseCatalogLoader {

    private static final List<String> SUPPORTED_LANGS = List.of("hi", "ar", "sw", "fr", "tr", "ru", "de", "nl");

    private final JsonMapper jsonMapper;
    private Map<String, Map<String, String>> catalog = Map.of();

    public PhraseCatalogLoader(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    @PostConstruct
    void loadCatalog() {
        Map<String, Map<String, String>> merged = new LinkedHashMap<>();

        UiPhraseCatalog.phrases().forEach((english, translations) -> {
            Map<String, String> row = merged.computeIfAbsent(english, key -> new LinkedHashMap<>());
            translations.forEach(row::putIfAbsent);
        });

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        for (String lang : SUPPORTED_LANGS) {
            try {
                Resource resource = resolver.getResource("classpath:i18n/messages-" + lang + ".json");
                if (!resource.exists()) {
                    continue;
                }
                Map<String, String> langPhrases = readMap(resource);
                langPhrases.forEach((english, translated) -> {
                    if (english == null || english.isBlank() || translated == null || translated.isBlank()) {
                        return;
                    }
                    String trimmedEnglish = english.trim();
                    String trimmedTranslated = translated.trim();
                    String lowerKey = trimmedEnglish.toLowerCase(Locale.ROOT);
                    String existingKey = merged.keySet().stream()
                            .filter(key -> key.equalsIgnoreCase(trimmedEnglish))
                            .findFirst()
                            .orElse(trimmedEnglish);
                    Map<String, String> row = merged.computeIfAbsent(existingKey, key -> new LinkedHashMap<>());
                    row.put(lang, trimmedTranslated);
                });
                log.info("Loaded {} UI phrases for language '{}'", langPhrases.size(), lang);
            } catch (Exception e) {
                log.warn("Failed to load i18n/messages-{}.json: {}", lang, e.getMessage());
            }
        }

        catalog = Map.copyOf(merged);
        log.info("UI phrase catalog ready with {} English keys", catalog.size());
    }

    public Map<String, Map<String, String>> getCatalog() {
        return catalog;
    }

    public Map<String, String> getPhrasesForLanguage(String langCode) {
        String code = langCode == null ? "en" : langCode.trim().toLowerCase(Locale.ROOT);
        if (code.isBlank() || "en".equals(code)) {
            return Map.of();
        }
        Map<String, String> phrases = new LinkedHashMap<>();
        catalog.forEach((english, translations) -> {
            String translated = translations.get(code);
            if (translated != null && !translated.isBlank()) {
                phrases.put(english, translated);
                phrases.putIfAbsent(english.toLowerCase(Locale.ROOT), translated);
            }
        });
        return phrases;
    }

    private Map<String, String> readMap(Resource resource) throws Exception {
        try (InputStream inputStream = resource.getInputStream()) {
            return jsonMapper.readValue(inputStream, new TypeReference<LinkedHashMap<String, String>>() {
            });
        }
    }
}
