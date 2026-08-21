package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.PaymentConfig;
import com.kantechsolution.smart_school.model.PaymentGatewaySetting;
import com.kantechsolution.smart_school.repository.PaymentConfigRepository;
import com.kantechsolution.smart_school.repository.PaymentGatewaySettingRepository;
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
@Order(30)
public class PaymentSettingsService implements ApplicationRunner {

    static final List<String> GATEWAYS = List.of(
            "paypal", "stripe", "payu", "ccavenue", "instamojo", "paystack", "razorpay",
            "paytm", "midtrans", "pesapal", "flutterwave", "ipayafrica", "jazzcash", "billplz",
            "sslcommerz", "walkingm", "mollie", "cashfree", "payfast", "toyyibpay",
            "twocheckout", "skrill", "payhere", "onepay", "dpopay", "momopay"
    );

    private static final Pattern PAIR = Pattern.compile("\"((?:\\\\.|[^\"\\\\])*)\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");

    private final PaymentGatewaySettingRepository gatewayRepository;
    private final PaymentConfigRepository configRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        GATEWAYS.forEach(this::requireGateway);
        requireConfig();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list() {
        Map<String, Object> gateways = new LinkedHashMap<>();
        for (String key : GATEWAYS) {
            PaymentGatewaySetting row = requireGateway(key);
            gateways.put(key, readSettings(row.getSettingsJson()));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("gateways", gateways);
        response.put("active", requireConfig().getActiveGateway());
        return response;
    }

    @Transactional
    public Map<String, Object> saveGateway(Map<String, Object> payload) {
        String gateway = text(payload.get("gateway")).toLowerCase();
        if (!GATEWAYS.contains(gateway)) {
            throw new IllegalArgumentException("Unknown payment gateway");
        }
        Map<String, Object> rawFields = payload.get("fields") instanceof Map<?, ?> map
                ? castMap(map)
                : payload;
        Map<String, Object> fields = new LinkedHashMap<>();
        rawFields.forEach((key, value) -> {
            if (!"gateway".equals(key) && !"fields".equals(key) && !"active".equals(key)) {
                fields.put(key, text(value));
            }
        });
        PaymentGatewaySetting row = requireGateway(gateway);
        row.setSettingsJson(writeJson(fields));
        gatewayRepository.save(row);
        return list();
    }

    @Transactional
    public Map<String, Object> saveActive(Map<String, Object> payload) {
        String active = text(payload.get("active")).toLowerCase();
        if (active.isEmpty()) {
            active = "none";
        }
        if (!"none".equals(active) && !GATEWAYS.contains(active)) {
            throw new IllegalArgumentException("Unknown payment gateway");
        }
        PaymentConfig config = requireConfig();
        config.setActiveGateway(active);
        configRepository.save(config);
        return list();
    }

    private PaymentGatewaySetting requireGateway(String gateway) {
        return gatewayRepository.findByGateway(gateway).orElseGet(() -> {
            PaymentGatewaySetting row = PaymentGatewaySetting.builder()
                    .gateway(gateway)
                    .settingsJson("{}")
                    .build();
            row.setIsActive(true);
            return gatewayRepository.save(row);
        });
    }

    private PaymentConfig requireConfig() {
        return configRepository.findAll().stream().findFirst().orElseGet(() -> {
            PaymentConfig row = PaymentConfig.builder()
                    .activeGateway("none")
                    .build();
            row.setIsActive(true);
            return configRepository.save(row);
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
