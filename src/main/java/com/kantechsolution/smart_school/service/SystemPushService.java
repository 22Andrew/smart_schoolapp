package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppPushToken;
import com.kantechsolution.smart_school.model.MobileAppMessage;
import com.kantechsolution.smart_school.model.SchoolMobileAppSetting;
import com.kantechsolution.smart_school.repository.AppPushTokenRepository;
import com.kantechsolution.smart_school.repository.MobileAppMessageRepository;
import com.kantechsolution.smart_school.repository.SchoolMobileAppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SystemPushService {

    private static final Logger log = LoggerFactory.getLogger(SystemPushService.class);

    private final MobileAppMessageRepository mobileAppMessageRepository;
    private final AppPushTokenRepository appPushTokenRepository;
    private final SchoolMobileAppSettingRepository mobileAppSettingRepository;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    public boolean isConfigured() {
        return resolveFcmServerKey() != null;
    }

    @Transactional
    public CommunicateDeliveryResult sendToMany(Collection<CommunicateRecipientResolver.PushTarget> targets,
                                                String title,
                                                String message) {
        CommunicateDeliveryResult result = new CommunicateDeliveryResult();
        Set<CommunicateRecipientResolver.PushTarget> uniqueTargets = new LinkedHashSet<>(targets);
        if (uniqueTargets.isEmpty()) {
            result.recordFailure("No mobile app recipients were found.");
            return result;
        }

        String fcmKey = resolveFcmServerKey();
        for (CommunicateRecipientResolver.PushTarget target : uniqueTargets) {
            try {
                storeInAppMessage(target, title, message);
                if (fcmKey != null) {
                    deliverFcm(target, title, message, fcmKey);
                }
                result.recordSuccess();
            } catch (Exception error) {
                log.error("Failed to deliver mobile app notification to {}:{}", target.userType(), target.sourceId(), error);
                result.recordFailure(target.userType() + ":" + target.sourceId() + ": " + error.getMessage());
            }
        }
        return result;
    }

    @Transactional
    public void registerToken(String userType, Long sourceId, String deviceToken, String platform) {
        if (deviceToken == null || deviceToken.isBlank()) {
            throw new IllegalArgumentException("Device token is required.");
        }
        if (userType == null || userType.isBlank()) {
            throw new IllegalArgumentException("User type is required.");
        }

        AppPushToken token = appPushTokenRepository.findByDeviceToken(deviceToken.trim())
                .orElseGet(() -> AppPushToken.builder().deviceToken(deviceToken.trim()).build());
        token.setUserType(userType.trim().toUpperCase());
        token.setSourceId(sourceId);
        token.setPlatform(platform == null ? "" : platform.trim());
        token.setIsActive(true);
        appPushTokenRepository.save(token);
    }

    private void storeInAppMessage(CommunicateRecipientResolver.PushTarget target, String title, String message) {
        MobileAppMessage row = MobileAppMessage.builder()
                .userType(target.userType())
                .sourceId(target.sourceId())
                .title(title == null || title.isBlank() ? "Notification" : title.trim())
                .message(message == null ? "" : message.trim())
                .isRead(false)
                .build();
        row.setIsActive(true);
        mobileAppMessageRepository.save(row);
    }

    private void deliverFcm(CommunicateRecipientResolver.PushTarget target,
                            String title,
                            String message,
                            String fcmKey) throws Exception {
        List<AppPushToken> tokens = appPushTokenRepository
                .findByUserTypeAndSourceIdAndIsActiveTrue(target.userType(), target.sourceId());
        if (tokens.isEmpty()) {
            return;
        }

        for (AppPushToken token : tokens) {
            String payload = "{"
                    + "\"to\":\"" + escapeJson(token.getDeviceToken()) + "\","
                    + "\"notification\":{"
                    + "\"title\":\"" + escapeJson(title) + "\","
                    + "\"body\":\"" + escapeJson(message) + "\""
                    + "}"
                    + "}";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://fcm.googleapis.com/fcm/send"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "key=" + fcmKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("FCM returned HTTP " + response.statusCode() + ": " + response.body());
            }
        }
    }

    private String resolveFcmServerKey() {
        return mobileAppSettingRepository.findAll().stream()
                .findFirst()
                .map(SchoolMobileAppSetting::getFcmServerKey)
                .filter(key -> key != null && !key.isBlank())
                .orElse(null);
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
}
