package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSmsService {

    private static final Logger log = LoggerFactory.getLogger(SystemSmsService.class);

    private final SmsConfigService smsConfigService;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    public boolean isConfigured() {
        Map<String, Object> config = smsConfigService.getActiveGatewayConfig();
        return config.containsKey("gateway");
    }

    public CommunicateDeliveryResult sendToMany(Collection<String> recipients, String message) {
        CommunicateDeliveryResult result = new CommunicateDeliveryResult();
        Map<String, Object> config = smsConfigService.getActiveGatewayConfig();
        if (!config.containsKey("gateway")) {
            result.recordFailure("SMS gateway is not configured. Enable a gateway under System Settings > SMS Config.");
            return result;
        }

        if (message == null || message.isBlank()) {
            result.recordFailure("SMS message is empty.");
            return result;
        }

        Set<String> phones = normalizePhones(recipients);
        if (phones.isEmpty()) {
            result.recordFailure("No valid mobile numbers were found.");
            return result;
        }

        String gateway = text(config.get("gateway")).toLowerCase(Locale.ROOT);
        for (String phone : phones) {
            try {
                sendViaGateway(gateway, config, phone, message);
                result.recordSuccess();
            } catch (Exception error) {
                log.error("Failed to send SMS to {} via {}", phone, gateway, error);
                result.recordFailure(phone + ": " + error.getMessage());
            }
        }
        return result;
    }

    private void sendViaGateway(String gateway, Map<String, Object> config, String phone, String message) throws Exception {
        switch (gateway) {
            case "twilio" -> sendTwilio(config, phone, message);
            case "msg91" -> sendMsg91(config, phone, message);
            case "textlocal" -> sendTextLocal(config, phone, message);
            case "clickatell" -> sendClickatell(config, phone, message);
            case "nexmo" -> sendNexmo(config, phone, message);
            case "africastalking" -> sendAfricasTalking(config, phone, message);
            case "bulksms" -> sendBulkSms(config, phone, message);
            case "smscountry" -> sendSmsCountry(config, phone, message);
            case "mobireach" -> sendMobiReach(config, phone, message);
            case "smsegypt" -> sendSmsEgypt(config, phone, message);
            case "smsgatewayhub" -> sendSmsGatewayHub(config, phone, message);
            case "custom" -> sendCustomGateway(config, phone, message);
            default -> throw new IllegalStateException("SMS gateway '" + gateway + "' is not supported.");
        }
    }

    private void sendTwilio(Map<String, Object> config, String phone, String message) throws Exception {
        String sid = required(config, "sid");
        String token = required(config, "token");
        String from = required(config, "senderNumber");
        String body = formBody(Map.of(
                "To", phone,
                "From", from,
                "Body", message
        ));
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", basicAuth(sid, token))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        dispatch(request, "Twilio");
    }

    private void sendMsg91(Map<String, Object> config, String phone, String message) throws Exception {
        String authKey = required(config, "authKey");
        String senderId = required(config, "senderId");
        String query = "authkey=" + encode(authKey)
                + "&mobiles=" + encode(stripPlus(phone))
                + "&message=" + encode(message)
                + "&sender=" + encode(senderId)
                + "&route=4"
                + "&country=0";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://control.msg91.com/api/sendhttp.php?" + query))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        dispatch(request, "MSG91");
    }

    private void sendTextLocal(Map<String, Object> config, String phone, String message) throws Exception {
        String hash = firstNonBlank(config, "hash", "apiKey");
        String senderId = text(config.get("senderId"));
        if (hash.isBlank()) {
            throw new IllegalStateException("TextLocal hash key is required.");
        }
        String body = formBody(Map.of(
                "apikey", hash,
                "numbers", stripPlus(phone),
                "message", message,
                "sender", senderId
        ));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.textlocal.in/send/"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        dispatch(request, "TextLocal");
    }

    private void sendClickatell(Map<String, Object> config, String phone, String message) throws Exception {
        String apiKey = firstNonBlank(config, "apiKey", "apikey");
        if (apiKey.isBlank()) {
            throw new IllegalStateException("Clickatell API key is required.");
        }
        String json = "{\"messages\":[{\"channel\":\"sms\",\"to\":[\"" + escapeJson(phone) + "\"],\"content\":\"" + escapeJson(message) + "\"}]}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://platform.clickatell.com/v1/message"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", apiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        dispatch(request, "Clickatell");
    }

    private void sendNexmo(Map<String, Object> config, String phone, String message) throws Exception {
        String apiKey = required(config, "apiKey");
        String apiSecret = required(config, "apiSecret");
        String from = required(config, "from");
        String body = formBody(Map.of(
                "api_key", apiKey,
                "api_secret", apiSecret,
                "from", from,
                "to", stripPlus(phone),
                "text", message
        ));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://rest.nexmo.com/sms/json"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        dispatch(request, "Nexmo");
    }

    private void sendAfricasTalking(Map<String, Object> config, String phone, String message) throws Exception {
        String username = required(config, "username");
        String apiKey = required(config, "apiKey");
        String from = text(config.get("from"));
        StringBuilder bodyBuilder = new StringBuilder();
        bodyBuilder.append("username=").append(encode(username));
        bodyBuilder.append("&to=").append(encode(phone));
        bodyBuilder.append("&message=").append(encode(message));
        if (!from.isBlank()) {
            bodyBuilder.append("&from=").append(encode(from));
        }
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.africastalking.com/version1/messaging"))
                .timeout(Duration.ofSeconds(30))
                .header("apiKey", apiKey)
                .header("Accept", "application/json")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(bodyBuilder.toString()))
                .build();
        dispatch(request, "AfricasTalking");
    }

    private void sendBulkSms(Map<String, Object> config, String phone, String message) throws Exception {
        String username = required(config, "username");
        String password = required(config, "password");
        String json = "{\"to\":[\"" + escapeJson(phone) + "\"],\"body\":\"" + escapeJson(message) + "\"}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.bulksms.com/v1/messages"))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", basicAuth(username, password))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        dispatch(request, "BulkSMS");
    }

    private void sendSmsCountry(Map<String, Object> config, String phone, String message) throws Exception {
        String username = required(config, "username");
        String password = firstNonBlank(config, "password", "authToken");
        String authKey = text(config.get("authKey"));
        String senderId = text(config.get("senderId"));
        String query = "User=" + encode(username)
                + "&passwd=" + encode(password.isBlank() ? authKey : password)
                + "&mobilenumber=" + encode(stripPlus(phone))
                + "&message=" + encode(message)
                + "&sid=" + encode(senderId)
                + "&mtype=N";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://api.smscountry.com/SMSCwebservice.aspx?" + query))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        dispatch(request, "SMS Country");
    }

    private void sendMobiReach(Map<String, Object> config, String phone, String message) throws Exception {
        String authKey = required(config, "authKey");
        String senderId = required(config, "senderId");
        String routeId = text(config.get("routeId"));
        String query = "AuthenticationKey=" + encode(authKey)
                + "&SenderId=" + encode(senderId)
                + "&RouteId=" + encode(routeId)
                + "&MobileNumber=" + encode(stripPlus(phone))
                + "&Message=" + encode(message);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://api.mobireach.com.bd/SendTextMessage?" + query))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        dispatch(request, "Mobi Reach");
    }

    private void sendSmsEgypt(Map<String, Object> config, String phone, String message) throws Exception {
        String username = required(config, "username");
        String password = required(config, "password");
        String senderId = required(config, "senderId");
        String type = text(config.get("type"));
        if (type.isBlank()) {
            type = "sms";
        }
        String query = "username=" + encode(username)
                + "&password=" + encode(password)
                + "&sender=" + encode(senderId)
                + "&mobile=" + encode(stripPlus(phone))
                + "&message=" + encode(message)
                + "&type=" + encode(type);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://smsegypt.com/sms/api/?" + query))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        dispatch(request, "SMS Egypt");
    }

    private void sendSmsGatewayHub(Map<String, Object> config, String phone, String message) throws Exception {
        String apiKey = required(config, "apiKey");
        String senderId = required(config, "senderId");
        String entityId = text(config.get("entityId"));
        String query = "APIKey=" + encode(apiKey)
                + "&senderid=" + encode(senderId)
                + "&channel=2"
                + "&DCS=0"
                + "&flashsms=0"
                + "&number=" + encode(stripPlus(phone))
                + "&text=" + encode(message)
                + (entityId.isBlank() ? "" : "&EntityId=" + encode(entityId));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.smsgatewayhub.com/api/mt/SendSMS?" + query))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        dispatch(request, "SMS Gateway Hub");
    }

    private void sendCustomGateway(Map<String, Object> config, String phone, String message) throws Exception {
        String apiUrl = required(config, "apiUrl");
        String senderId = text(config.get("senderId"));
        String resolvedUrl = apiUrl
                .replace("{phone}", encodePath(stripPlus(phone)))
                .replace("{message}", encodePath(message))
                .replace("{sender}", encodePath(senderId));
        String method = text(config.get("apiMethod"));
        if (method.isBlank()) {
            method = "GET";
        }
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(resolvedUrl))
                .timeout(Duration.ofSeconds(30));
        HttpRequest request = "POST".equalsIgnoreCase(method)
                ? builder.POST(HttpRequest.BodyPublishers.noBody()).build()
                : builder.GET().build();
        dispatch(request, text(config.get("gatewayName")).isBlank() ? "Custom SMS" : text(config.get("gatewayName")));
    }

    private void dispatch(HttpRequest request, String provider) throws Exception {
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException(provider + " returned HTTP " + response.statusCode() + ": " + response.body());
        }
        String body = response.body() == null ? "" : response.body();
        if (body.toLowerCase(Locale.ROOT).contains("\"status\":\"failed\"")
                || body.toLowerCase(Locale.ROOT).contains("invalid")
                || body.toLowerCase(Locale.ROOT).startsWith("error")) {
            throw new IllegalStateException(provider + " rejected the message: " + body);
        }
    }

    private Set<String> normalizePhones(Collection<String> recipients) {
        Set<String> phones = new LinkedHashSet<>();
        if (recipients == null) {
            return phones;
        }
        for (String recipient : recipients) {
            if (recipient == null || recipient.isBlank()) {
                continue;
            }
            String digits = recipient.replaceAll("[^0-9+]", "");
            if (digits.length() >= 7) {
                phones.add(digits);
            }
        }
        return phones;
    }

    private String required(Map<String, Object> config, String key) {
        String value = text(config.get(key));
        if (value.isBlank()) {
            throw new IllegalStateException("Missing SMS setting: " + key);
        }
        return value;
    }

    private String firstNonBlank(Map<String, Object> config, String... keys) {
        for (String key : keys) {
            String value = text(config.get(key));
            if (!value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String stripPlus(String phone) {
        return phone == null ? "" : phone.replace("+", "");
    }

    private String basicAuth(String username, String password) {
        String token = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }

    private String formBody(Map<String, String> values) {
        return values.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private String encodePath(String value) {
        return encode(value == null ? "" : value);
    }
}
