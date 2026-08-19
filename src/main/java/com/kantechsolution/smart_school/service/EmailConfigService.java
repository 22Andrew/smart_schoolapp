package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.EmailConfig;
import com.kantechsolution.smart_school.repository.EmailConfigRepository;
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
@Order(29)
public class EmailConfigService implements ApplicationRunner {

    private final EmailConfigRepository repository;

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
        EmailConfig row = requireConfig();
        row.setEmailEngine(engine(payload.get("emailEngine")));
        row.setFromEmail(text(payload.get("fromEmail")));
        row.setSmtpUsername(text(payload.get("smtpUsername")));
        String password = text(payload.get("smtpPassword"));
        if (!password.isEmpty()) {
            row.setSmtpPassword(password);
        }
        row.setSmtpServer(text(payload.get("smtpServer")));
        row.setSmtpPort(text(payload.get("smtpPort")));
        row.setSmtpSecurity(security(payload.get("smtpSecurity")));
        row.setSmtpAuth(auth(payload.get("smtpAuth")));
        row.setAwsAccessKeyId(text(payload.get("awsAccessKeyId")));
        String secret = text(payload.get("awsSecretAccessKey"));
        if (!secret.isEmpty()) {
            row.setAwsSecretAccessKey(secret);
        }
        row.setAwsRegion(region(payload.get("awsRegion")));
        return toMap(repository.save(row));
    }

    private EmailConfig requireConfig() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            EmailConfig row = EmailConfig.builder()
                    .emailEngine("smtp")
                    .smtpPort("587")
                    .smtpSecurity("tls")
                    .smtpAuth("on")
                    .awsRegion("us-east-1")
                    .build();
            row.setIsActive(true);
            return repository.save(row);
        });
    }

    private Map<String, Object> toMap(EmailConfig row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("emailEngine", row.getEmailEngine());
        map.put("fromEmail", row.getFromEmail());
        map.put("smtpUsername", row.getSmtpUsername());
        map.put("hasPassword", row.getSmtpPassword() != null && !row.getSmtpPassword().isBlank());
        map.put("passwordHint", mask(row.getSmtpPassword()));
        map.put("smtpServer", row.getSmtpServer());
        map.put("smtpPort", row.getSmtpPort());
        map.put("smtpSecurity", row.getSmtpSecurity());
        map.put("smtpAuth", row.getSmtpAuth());
        map.put("awsAccessKeyId", row.getAwsAccessKeyId());
        map.put("hasAwsSecret", row.getAwsSecretAccessKey() != null && !row.getAwsSecretAccessKey().isBlank());
        map.put("awsSecretHint", mask(row.getAwsSecretAccessKey()));
        map.put("awsRegion", row.getAwsRegion());
        return map;
    }

    private static String engine(Object value) {
        String text = text(value).toLowerCase().replace(" ", "_");
        if ("sendmail".equals(text)) return "sendmail";
        if ("aws_ses".equals(text) || "awsses".equals(text) || "ses".equals(text)) return "aws_ses";
        return "smtp";
    }

    private static String region(Object value) {
        String text = text(value);
        return text.isEmpty() ? "us-east-1" : text;
    }

    private static String security(Object value) {
        String text = text(value).toLowerCase();
        if ("ssl".equals(text) || "off".equals(text) || "none".equals(text)) return text.equals("none") ? "off" : text;
        return "tls";
    }

    private static String auth(Object value) {
        return "off".equalsIgnoreCase(text(value)) ? "off" : "on";
    }

    private static String mask(String password) {
        if (password == null || password.isBlank()) {
            return "";
        }
        if (password.length() <= 4) {
            return "*".repeat(password.length());
        }
        return password.substring(0, 2)
                + "*".repeat(Math.max(8, password.length() - 4))
                + password.substring(password.length() - 2);
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
