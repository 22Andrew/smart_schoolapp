package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.WhatsappConfig;
import com.kantechsolution.smart_school.repository.WhatsappConfigRepository;
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
@Order(27)
public class WhatsappConfigService implements ApplicationRunner {

    private final WhatsappConfigRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        requireConfig();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getConfig() {
        return toMap(requireConfig());
    }

    @Transactional
    public Map<String, Object> save(Map<String, Object> payload) {
        WhatsappConfig row = requireConfig();
        String provider = text(payload.get("provider"));
        if (!"TWILIO".equalsIgnoreCase(provider)) {
            provider = "META";
        }
        row.setActiveProvider(provider.toUpperCase());
        if ("TWILIO".equals(row.getActiveProvider())) {
            row.setTwilioAccountSid(required(payload.get("accountSid"), "SID is required"));
            row.setTwilioAuthToken(required(payload.get("authToken"), "Token is required"));
            row.setTwilioFromNumber(required(payload.get("fromNumber"), "From Number is required"));
            row.setTwilioStatus(status(payload.get("status")));
        } else {
            row.setMetaAccessToken(required(payload.get("accessToken"), "Access Token is required"));
            row.setMetaPhoneNumber(required(payload.get("phoneNumber"), "Registered Phone Number is required"));
            row.setMetaLanguage(required(payload.get("language"), "Language is required"));
            row.setMetaStatus(status(payload.get("status")));
        }
        return toMap(repository.save(row));
    }

    private WhatsappConfig requireConfig() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            WhatsappConfig row = WhatsappConfig.builder()
                    .activeProvider("META")
                    .metaLanguage("en")
                    .metaStatus("Enabled")
                    .twilioStatus("Disabled")
                    .build();
            row.setIsActive(true);
            return repository.save(row);
        });
    }

    private Map<String, Object> toMap(WhatsappConfig row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("provider", row.getActiveProvider());
        map.put("accessToken", row.getMetaAccessToken());
        map.put("phoneNumber", row.getMetaPhoneNumber());
        map.put("language", row.getMetaLanguage());
        map.put("metaStatus", row.getMetaStatus());
        map.put("accountSid", row.getTwilioAccountSid());
        map.put("authToken", row.getTwilioAuthToken());
        map.put("fromNumber", row.getTwilioFromNumber());
        map.put("twilioStatus", row.getTwilioStatus());
        return map;
    }

    private static String required(Object value, String message) {
        String text = text(value);
        if (text.isBlank()) throw new IllegalArgumentException(message);
        return text;
    }

    private static String status(Object value) {
        return "Disabled".equalsIgnoreCase(text(value)) ? "Disabled" : "Enabled";
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
