package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourseSetting;
import com.kantechsolution.smart_school.repository.OnlineCourseSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class OnlineCourseSettingService {

    @Autowired
    private OnlineCourseSettingRepository settingRepository;

    @Transactional
    public Map<String, Object> getSettings() {
        return toRow(requireSettings());
    }

    @Transactional
    public Map<String, Object> saveCurriculum(Map<String, Object> body) {
        OnlineCourseSetting settings = requireSettings();
        settings.setEnableQuiz(asBoolean(body.get("enableQuiz")));
        settings.setEnableExam(asBoolean(body.get("enableExam")));
        settings.setEnableAssignment(asBoolean(body.get("enableAssignment")));
        return toRow(settingRepository.save(settings));
    }

    @Transactional
    public Map<String, Object> saveAws(Map<String, Object> body) {
        String accessKey = text(body.get("awsAccessKey"));
        String secretKey = text(body.get("awsSecretKey"));
        String bucket = text(body.get("awsBucketName"));
        String region = text(body.get("awsRegion"));
        if (accessKey.isBlank() || secretKey.isBlank() || bucket.isBlank() || region.isBlank()) {
            throw new IllegalArgumentException("All AWS S3 fields are required");
        }

        OnlineCourseSetting settings = requireSettings();
        settings.setAwsAccessKey(accessKey);
        settings.setAwsSecretKey(secretKey);
        settings.setAwsBucketName(bucket);
        settings.setAwsRegion(region);
        return toRow(settingRepository.save(settings));
    }

    @Transactional
    public Map<String, Object> saveGuest(Map<String, Object> body) {
        String prefix = text(body.get("guestPrefix"));
        Integer startFrom = asInt(body.get("guestIdStart"));
        if (prefix.isBlank()) {
            throw new IllegalArgumentException("Guest User Prefix is required");
        }
        if (startFrom == null || startFrom < 1) {
            throw new IllegalArgumentException("Guest User Id Start From must be a positive number");
        }

        OnlineCourseSetting settings = requireSettings();
        settings.setGuestLoginEnabled(asBoolean(body.get("guestLoginEnabled")));
        settings.setGuestPrefix(prefix);
        settings.setGuestIdStart(startFrom);
        return toRow(settingRepository.save(settings));
    }

    private OnlineCourseSetting requireSettings() {
        return settingRepository.findAll().stream().findFirst().orElseGet(() -> {
            OnlineCourseSetting defaults = new OnlineCourseSetting();
            return settingRepository.save(defaults);
        });
    }

    private Map<String, Object> toRow(OnlineCourseSetting settings) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("enableQuiz", settings.isEnableQuiz());
        row.put("enableExam", settings.isEnableExam());
        row.put("enableAssignment", settings.isEnableAssignment());
        row.put("awsAccessKey", blank(settings.getAwsAccessKey()));
        row.put("awsSecretKey", blank(settings.getAwsSecretKey()));
        row.put("awsBucketName", blank(settings.getAwsBucketName()));
        row.put("awsRegion", blank(settings.getAwsRegion()));
        row.put("guestLoginEnabled", settings.isGuestLoginEnabled());
        row.put("guestPrefix", blankTo(settings.getGuestPrefix(), "Guest"));
        row.put("guestIdStart", settings.getGuestIdStart() == null ? 100 : settings.getGuestIdStart());
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private boolean asBoolean(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean bool) return bool;
        String text = String.valueOf(value).trim();
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "on".equalsIgnoreCase(text) || "yes".equalsIgnoreCase(text);
    }

    private Integer asInt(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) return null;
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number value");
        }
    }
}
