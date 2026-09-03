package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppLanguageTranslationService {

    private final AppLanguageService appLanguageService;
    private final PhraseCatalogLoader phraseCatalogLoader;

    @Transactional(readOnly = true)
    public Map<String, String> getPhrasesForActiveLanguage() {
        Map<String, Object> active = appLanguageService.getActiveLanguageMap();
        String code = String.valueOf(active.getOrDefault("shortCode", "en"));
        return getPhrasesForLanguage(code);
    }

    public Map<String, String> getPhrasesForLanguage(String langCode) {
        return phraseCatalogLoader.getPhrasesForLanguage(langCode);
    }

    public int getPhraseCount() {
        return phraseCatalogLoader.getCatalog().size();
    }
}
