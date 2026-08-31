package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppLanguage;
import com.kantechsolution.smart_school.repository.AppLanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(36)
public class AppLanguageService implements ApplicationRunner {

    private static final String[][] DEFAULTS = {
            {"Afrikaans", "af", "af", "0"},
            {"Albanian", "sq", "al", "0"},
            {"Amharic", "am", "et", "0"},
            {"Arabic", "ar", "sa", "1"},
            {"Azerbaijani", "az", "az", "0"},
            {"Basque", "eu", "es", "0"},
            {"Bengali", "bn", "bd", "0"},
            {"Bosnian", "bs", "ba", "0"},
            {"Catalan", "ca", "es", "0"},
            {"Cebuano", "ceb", "ph", "0"},
            {"Chinese", "zh", "cn", "0"},
            {"Croatian", "hr", "hr", "0"},
            {"Czech", "cs", "cz", "0"},
            {"Danish", "da", "dk", "0"},
            {"Dutch", "nl", "nl", "0"},
            {"English", "en", "us", "0"},
            {"Estonian", "et", "ee", "0"},
            {"Finnish", "fi", "fi", "0"},
            {"French", "fr", "fr", "0"},
            {"Galician", "gl", "es", "0"},
            {"Georgian", "ka", "ge", "0"},
            {"German", "de", "de", "0"},
            {"Greek", "el", "gr", "0"},
            {"Gujarati", "gu", "in", "0"},
            {"Hebrew", "he", "il", "1"},
            {"Hindi", "hi", "in", "0"},
            {"Hungarian", "hu", "hu", "0"},
            {"Icelandic", "is", "is", "0"},
            {"Indonesian", "id", "id", "0"},
            {"Irish", "ga", "ie", "0"},
            {"Italian", "it", "it", "0"},
            {"Japanese", "ja", "jp", "0"},
            {"Javanese", "jv", "id", "0"},
            {"Kannada", "kn", "in", "0"},
            {"Khmer", "km", "kh", "0"},
            {"Korean", "ko", "kr", "0"},
            {"Lao", "lo", "la", "0"},
            {"Latvian", "lv", "lv", "0"},
            {"Lithuanian", "lt", "lt", "0"},
            {"Macedonian", "mk", "mk", "0"},
            {"Malay", "ms", "my", "0"},
            {"Malayalam", "ml", "in", "0"},
            {"Maltese", "mt", "mt", "0"},
            {"Marathi", "mr", "in", "0"},
            {"Mongolian", "mn", "mn", "0"},
            {"Nepali", "ne", "np", "0"},
            {"Norwegian", "no", "no", "0"},
            {"Persian", "fa", "ir", "1"},
            {"Polish", "pl", "pl", "0"},
            {"Portuguese", "pt", "pt", "0"},
            {"Punjabi", "pa", "in", "0"},
            {"Romanian", "ro", "ro", "0"},
            {"Russian", "ru", "ru", "0"},
            {"Serbian", "sr", "rs", "0"},
            {"Sinhala", "si", "lk", "0"},
            {"Slovak", "sk", "sk", "0"},
            {"Slovenian", "sl", "si", "0"},
            {"Somali", "so", "so", "0"},
            {"Spanish", "es", "es", "0"},
            {"Swahili", "sw", "ke", "0"},
            {"Swedish", "sv", "se", "0"},
            {"Tamil", "ta", "in", "0"},
            {"Telugu", "te", "in", "0"},
            {"Thai", "th", "th", "0"},
            {"Turkish", "tr", "tr", "0"},
            {"Ukrainian", "uk", "ua", "0"},
            {"Urdu", "ur", "pk", "1"},
            {"Uzbek", "uz", "uz", "0"},
            {"Vietnamese", "vi", "vn", "0"},
            {"Welsh", "cy", "gb", "0"},
            {"Xhosa", "xh", "za", "0"},
            {"Yiddish", "yi", "il", "1"},
            {"Yoruba", "yo", "ng", "0"},
            {"Zulu", "zu", "za", "0"}
    };

    private final AppLanguageRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() == 0) {
            seedDefaultLanguages();
        }
        repository.findByShortCodeIgnoreCase("en").ifPresent(language -> {
            if (!"us".equalsIgnoreCase(language.getCountryCode())) {
                language.setCountryCode("us");
                repository.save(language);
            }
        });
        ensureHeaderLanguagesEnabled();
    }

    private void ensureHeaderLanguagesEnabled() {
        for (String code : List.of("en", "hi", "ar", "sw", "fr", "tr", "ru", "de", "nl")) {
            repository.findByShortCodeIgnoreCase(code).ifPresent(language -> {
                if (!Boolean.TRUE.equals(language.getIsEnabled())) {
                    language.setIsEnabled(true);
                    repository.save(language);
                }
            });
        }
        if (repository.findFirstByIsDefaultTrue().isEmpty()) {
            repository.findByShortCodeIgnoreCase("en").ifPresent(language -> {
                language.setIsDefault(true);
                language.setIsEnabled(true);
                repository.save(language);
            });
        }
    }

    private void seedDefaultLanguages() {
        for (String[] row : DEFAULTS) {
            boolean english = "en".equals(row[1]);
            AppLanguage language = AppLanguage.builder()
                    .name(row[0])
                    .shortCode(row[1])
                    .countryCode(row[2])
                    .isRtl("1".equals(row[3]))
                    .isEnabled(true)
                    .isDefault(english)
                    .build();
            language.setIsActive(true);
            repository.save(language);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listHeaderLanguages() {
        List<String> headerOrder = List.of("en", "hi", "ar", "sw", "fr", "tr", "ru", "de", "nl");
        Map<String, Map<String, Object>> byCode = listAll().stream()
                .filter(language -> Boolean.TRUE.equals(language.get("isEnabled")))
                .collect(java.util.stream.Collectors.toMap(
                        language -> String.valueOf(language.get("shortCode")).toLowerCase(),
                        language -> language,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
        List<Map<String, Object>> ordered = new java.util.ArrayList<>();
        for (String code : headerOrder) {
            Map<String, Object> language = byCode.get(code);
            if (language != null) {
                ordered.add(enrichHeaderLanguage(language));
            }
        }
        if (ordered.isEmpty()) {
            return listAll().stream()
                    .filter(language -> Boolean.TRUE.equals(language.get("isEnabled")))
                    .limit(9)
                    .map(this::enrichHeaderLanguage)
                    .toList();
        }
        return ordered;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getActiveLanguageMap() {
        AppLanguage language = repository.findFirstByIsDefaultTrue()
                .or(() -> repository.findByShortCodeIgnoreCase("en"))
                .orElse(null);
        if (language == null) {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("id", null);
            fallback.put("name", "English");
            fallback.put("shortCode", "en");
            fallback.put("countryCode", "us");
            fallback.put("isRtl", false);
            fallback.put("isEnabled", true);
            fallback.put("isDefault", true);
            return enrichHeaderLanguage(fallback);
        }
        return enrichHeaderLanguage(toMap(language));
    }

    private Map<String, Object> enrichHeaderLanguage(Map<String, Object> language) {
        Map<String, Object> enriched = new LinkedHashMap<>(language);
        String shortCode = String.valueOf(language.getOrDefault("shortCode", "en")).toLowerCase();
        String countryCode = String.valueOf(language.getOrDefault("countryCode", "us")).toLowerCase();
        enriched.put("listFlagCode", listFlagCode(shortCode, countryCode));
        enriched.put("headerFlagCode", headerFlagCode(shortCode, countryCode));
        return enriched;
    }

    private static String listFlagCode(String shortCode, String countryCode) {
        if ("en".equalsIgnoreCase(shortCode)) {
            return "us";
        }
        return countryCode == null || countryCode.isBlank() ? "sl" : countryCode.toLowerCase();
    }

    private static String headerFlagCode(String shortCode, String countryCode) {
        if ("en".equalsIgnoreCase(shortCode)) {
            return "us";
        }
        return countryCode == null || countryCode.isBlank() ? "us" : countryCode.toLowerCase();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return repository.findAllByOrderByNameAsc().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> payload) {
        String name = required(payload.get("name"), "Language");
        String shortCode = required(payload.get("shortCode"), "Short code").toLowerCase();
        String countryCode = required(payload.get("countryCode"), "Country code").toLowerCase();
        if (repository.findByShortCodeIgnoreCase(shortCode).isPresent()) {
            throw new IllegalArgumentException("Short code already exists");
        }
        AppLanguage language = AppLanguage.builder()
                .name(name)
                .shortCode(shortCode)
                .countryCode(countryCode)
                .isRtl(bool(payload.get("isRtl")))
                .isEnabled(true)
                .isDefault(false)
                .build();
        language.setIsActive(true);
        return toMap(repository.save(language));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> payload) {
        AppLanguage language = requireLanguage(id);
        if (payload.containsKey("name")) {
            language.setName(required(payload.get("name"), "Language"));
        }
        if (payload.containsKey("shortCode")) {
            String shortCode = required(payload.get("shortCode"), "Short code").toLowerCase();
            if (repository.existsByShortCodeIgnoreCaseAndIdNot(shortCode, id)) {
                throw new IllegalArgumentException("Short code already exists");
            }
            language.setShortCode(shortCode);
        }
        if (payload.containsKey("countryCode")) {
            language.setCountryCode(required(payload.get("countryCode"), "Country code").toLowerCase());
        }
        if (payload.containsKey("isRtl")) {
            language.setIsRtl(bool(payload.get("isRtl")));
        }
        if (payload.containsKey("isEnabled")) {
            boolean enabled = bool(payload.get("isEnabled"));
            if (!enabled && Boolean.TRUE.equals(language.getIsDefault())) {
                throw new IllegalArgumentException("The active language cannot be disabled");
            }
            language.setIsEnabled(enabled);
        }
        return toMap(repository.save(language));
    }

    @Transactional
    public Map<String, Object> activate(Long id) {
        AppLanguage language = requireLanguage(id);
        if (!Boolean.TRUE.equals(language.getIsEnabled())) {
            throw new IllegalArgumentException("Enable the language before setting it active");
        }
        repository.findAll().forEach(item -> {
            if (Boolean.TRUE.equals(item.getIsDefault())) {
                item.setIsDefault(false);
                repository.save(item);
            }
        });
        language.setIsDefault(true);
        language.setIsEnabled(true);
        return enrichHeaderLanguage(toMap(repository.save(language)));
    }

    private AppLanguage requireLanguage(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Language not found"));
    }

    private Map<String, Object> toMap(AppLanguage language) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", language.getId());
        map.put("name", language.getName());
        map.put("shortCode", language.getShortCode());
        map.put("countryCode", language.getCountryCode());
        map.put("isRtl", Boolean.TRUE.equals(language.getIsRtl()));
        map.put("isEnabled", Boolean.TRUE.equals(language.getIsEnabled()));
        map.put("isDefault", Boolean.TRUE.equals(language.getIsDefault()));
        return map;
    }

    private static boolean bool(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        String text = value == null ? "" : value.toString().trim().toLowerCase();
        return "true".equals(text) || "1".equals(text) || "on".equals(text) || "yes".equals(text);
    }

    private static String required(Object value, String field) {
        String text = value == null ? "" : value.toString().trim();
        if (text.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return text;
    }
}
