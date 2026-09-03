package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.SmsGatewaySetting;
import com.kantechsolution.smart_school.repository.SmsGatewaySettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Order(28)
public class SmsConfigService implements ApplicationRunner {

    static final List<String> GATEWAYS = List.of(
            "clickatell", "twilio", "msg91", "textlocal", "smscountry", "bulksms",
            "mobireach", "nexmo", "africastalking", "smsegypt", "smsgatewayhub", "custom"
    );

    private static final Pattern PAIR = Pattern.compile("\"((?:\\\\.|[^\"\\\\])*)\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");

    private final SmsGatewaySettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        GATEWAYS.forEach(this::requireGateway);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list() {
        Map<String, Object> gateways = new LinkedHashMap<>();
        String enabled = null;
        for (String key : GATEWAYS) {
            SmsGatewaySetting row = requireGateway(key);
            Map<String, Object> item = readSettings(row.getSettingsJson());
            item.put("status", text(row.getStatus()));
            gateways.put(key, item);
            if ("Enabled".equalsIgnoreCase(row.getStatus())) {
                enabled = key;
            }
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("gateways", gateways);
        response.put("active", enabled == null ? "clickatell" : enabled);
        return response;
    }

    @Transactional
    public Map<String, Object> save(Map<String, Object> payload) {
        String gateway = text(payload.get("gateway")).toLowerCase();
        if (!GATEWAYS.contains(gateway)) {
            throw new IllegalArgumentException("Unknown SMS gateway");
        }
        String status = text(payload.get("status"));
        if (!"Enabled".equalsIgnoreCase(status) && !"Disabled".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Status is required");
        }
        status = "Enabled".equalsIgnoreCase(status) ? "Enabled" : "Disabled";

        Map<String, Object> rawFields = payload.get("fields") instanceof Map<?, ?> map
                ? castMap(map)
                : payload;
        Map<String, Object> fields = new LinkedHashMap<>();
        rawFields.forEach((key, value) -> {
            if (!"gateway".equals(key) && !"status".equals(key) && !"fields".equals(key)) {
                fields.put(key, text(value));
            }
        });

        SmsGatewaySetting row = requireGateway(gateway);
        row.setStatus(status);
        row.setSettingsJson(writeJson(fields));
        repository.save(row);

        if ("Enabled".equals(status)) {
            repository.findAll().stream()
                    .filter(item -> !gateway.equals(item.getGateway()))
                    .forEach(item -> {
                        item.setStatus("Disabled");
                        repository.save(item);
                    });
        }
        return list();
    }

    private SmsGatewaySetting requireGateway(String gateway) {
        return repository.findByGateway(gateway).orElseGet(() -> {
            SmsGatewaySetting row = SmsGatewaySetting.builder()
                    .gateway(gateway)
                    .settingsJson("{}")
                    .status("")
                    .build();
            row.setIsActive(true);
            return repository.save(row);
        });
    }

    private static Map<String, Object> castMap(Map<?, ?> map) {
        Map<String, Object> copy = new LinkedHashMap<>();
        map.forEach((key, value) -> copy.put(String.valueOf(key), value));
        return copy;
    }

    private static Map<String, Object> readSettings(String json) {
        Map<String, Object> fields = new LinkedHashMap<>();
        if (json == null || json.isBlank() || "{}".equals(json.trim())) {
            return fields;
        }
        Matcher matcher = PAIR.matcher(json);
        while (matcher.find()) {
            fields.put(unescape(matcher.group(1)), unescape(matcher.group(2)));
        }
        return fields;
    }

    private static String writeJson(Map<String, Object> fields) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : fields.entrySet()) {
            if (!first) json.append(',');
            first = false;
            json.append('"').append(escape(entry.getKey())).append("\":\"")
                    .append(escape(text(entry.getValue()))).append('"');
        }
        return json.append('}').toString();
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String unescape(String value) {
        return value.replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
