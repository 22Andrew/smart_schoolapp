package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ConferenceCredential;
import com.kantechsolution.smart_school.repository.ConferenceCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ConferenceCredentialService implements ApplicationRunner {

    private static final String DEFAULT_REDIRECT_URL = "https://demo.smart-school.in/admin/conference/generatetoken";

    @Autowired
    private ConferenceCredentialRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        ConferenceCredential credential = new ConferenceCredential();
        credential.setApiKey("s4aA8iuGRXK5kj5JMfUQtg");
        credential.setApiSecret("wOELxqU7WGzH4q3knJ2Yh5DfAqrVBypB");
        credential.setRedirectUrl(DEFAULT_REDIRECT_URL);
        credential.setTeacherApiCredential(true);
        credential.setStaffZoomClient("zoom_app");
        credential.setStudentZoomClient("zoom_app");
        credential.setParentLiveClass(true);
        repository.save(credential);
    }

    @Transactional
    public Map<String, Object> getCredentials() {
        return toMap(requireCredential());
    }

    @Transactional
    public Map<String, Object> saveCredentials(Map<String, Object> body) {
        ConferenceCredential credential = requireCredential();
        credential.setApiKey(text(body.get("apiKey")));
        credential.setApiSecret(text(body.get("apiSecret")));
        if (!text(body.get("redirectUrl")).isBlank()) {
            credential.setRedirectUrl(text(body.get("redirectUrl")));
        }
        if (body.containsKey("teacherApiCredential")) {
            credential.setTeacherApiCredential(asBoolean(body.get("teacherApiCredential")));
        }
        if (body.containsKey("staffZoomClient")) {
            credential.setStaffZoomClient(normalizeClient(text(body.get("staffZoomClient"))));
        }
        if (body.containsKey("studentZoomClient")) {
            credential.setStudentZoomClient(normalizeClient(text(body.get("studentZoomClient"))));
        }
        if (body.containsKey("parentLiveClass")) {
            credential.setParentLiveClass(asBoolean(body.get("parentLiveClass")));
        }
        return toMap(repository.save(credential));
    }

    @Transactional
    public Map<String, Object> resetCredentials() {
        ConferenceCredential credential = requireCredential();
        credential.setApiKey("");
        credential.setApiSecret("");
        credential.setAccessToken("");
        return toMap(repository.save(credential));
    }

    @Transactional
    public Map<String, Object> getAccessToken() {
        ConferenceCredential credential = requireCredential();
        if (text(credential.getApiKey()).isBlank() || text(credential.getApiSecret()).isBlank()) {
            throw new IllegalArgumentException("Zoom API Key and Secret are required");
        }
        credential.setAccessToken("demo-zoom-access-token");
        return toMap(repository.save(credential));
    }

    private ConferenceCredential requireCredential() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            ConferenceCredential defaults = new ConferenceCredential();
            defaults.setRedirectUrl(DEFAULT_REDIRECT_URL);
            defaults.setStaffZoomClient("zoom_app");
            defaults.setStudentZoomClient("zoom_app");
            return repository.save(defaults);
        });
    }

    private Map<String, Object> toMap(ConferenceCredential credential) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("apiKey", blank(credential.getApiKey()));
        map.put("apiSecret", blank(credential.getApiSecret()));
        map.put("redirectUrl", blank(credential.getRedirectUrl()));
        map.put("accessToken", blank(credential.getAccessToken()));
        map.put("hasAccessToken", !text(credential.getAccessToken()).isBlank());
        map.put("teacherApiCredential", credential.isTeacherApiCredential());
        map.put("staffZoomClient", blank(credential.getStaffZoomClient()));
        map.put("studentZoomClient", blank(credential.getStudentZoomClient()));
        map.put("parentLiveClass", credential.isParentLiveClass());
        return map;
    }

    private String normalizeClient(String value) {
        if ("web".equalsIgnoreCase(value)) {
            return "web";
        }
        return "zoom_app";
    }

    private boolean asBoolean(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        String text = String.valueOf(value).trim();
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "on".equalsIgnoreCase(text);
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }
}
