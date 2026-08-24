package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AuditTrail;
import com.kantechsolution.smart_school.repository.AuditTrailRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuditTrailService implements ApplicationRunner {

    private static final DateTimeFormatter DISPLAY_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");

    private final AuditTrailRepository auditTrailRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (auditTrailRepository.count() == 0) {
            seedSampleRecords();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listRecords() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (AuditTrail record : auditTrailRepository.findAllByOrderByEventDateTimeDesc()) {
            rows.add(toMap(record));
        }
        return rows;
    }

    @Transactional
    public void recordLogin(String username, HttpServletRequest request) {
        recordEvent(
                "User " + username + " logged in successfully",
                username,
                request,
                "Login",
                "Web");
    }

    @Transactional
    public void recordEvent(String message,
                            String username,
                            HttpServletRequest request,
                            String action,
                            String platform) {
        if (username == null || username.isBlank()) {
            return;
        }

        AuditTrail record = AuditTrail.builder()
                .message(blankTo(message, "System activity recorded"))
                .username(username.trim())
                .ipAddress(resolveClientIp(request))
                .action(blankTo(action, "Action"))
                .platform(blankTo(platform, "Web"))
                .agent(formatUserAgent(request != null ? request.getHeader("User-Agent") : null))
                .eventDateTime(LocalDateTime.now())
                .build();
        auditTrailRepository.save(record);
    }

    @Transactional
    public void clearAll() {
        auditTrailRepository.deleteAll();
    }

    private Map<String, Object> toMap(AuditTrail record) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", record.getId());
        row.put("message", record.getMessage());
        row.put("username", record.getUsername());
        row.put("ipAddress", blankTo(record.getIpAddress(), ""));
        row.put("action", record.getAction());
        row.put("platform", blankTo(record.getPlatform(), ""));
        row.put("agent", blankTo(record.getAgent(), ""));
        row.put("dateTime", record.getEventDateTime() != null
                ? record.getEventDateTime().format(DISPLAY_FMT) : "");
        return row;
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "" : request.getRemoteAddr();
    }

    private String formatUserAgent(String rawAgent) {
        if (rawAgent == null || rawAgent.isBlank()) {
            return "-";
        }

        String browser = "Unknown Browser";
        Matcher chrome = Pattern.compile("Chrome/([\\d.]+)", Pattern.CASE_INSENSITIVE).matcher(rawAgent);
        Matcher firefox = Pattern.compile("Firefox/([\\d.]+)", Pattern.CASE_INSENSITIVE).matcher(rawAgent);
        Matcher edge = Pattern.compile("Edg/([\\d.]+)", Pattern.CASE_INSENSITIVE).matcher(rawAgent);
        Matcher safari = Pattern.compile("Version/([\\d.]+).*Safari", Pattern.CASE_INSENSITIVE).matcher(rawAgent);

        if (edge.find()) {
            browser = "Edge " + edge.group(1);
        } else if (chrome.find()) {
            browser = "Chrome " + chrome.group(1);
        } else if (firefox.find()) {
            browser = "Firefox " + firefox.group(1);
        } else if (safari.find()) {
            browser = "Safari " + safari.group(1);
        }

        String os = "Unknown OS";
        if (rawAgent.contains("Windows NT 10.0")) {
            os = "Windows 10";
        } else if (rawAgent.contains("Windows NT 11.0")) {
            os = "Windows 11";
        } else if (rawAgent.contains("Windows")) {
            os = "Windows";
        } else if (rawAgent.contains("Android")) {
            os = "Android";
        } else if (rawAgent.contains("iPhone") || rawAgent.contains("iPad")) {
            os = "iOS";
        } else if (rawAgent.contains("Mac OS X")) {
            os = "macOS";
        } else if (rawAgent.contains("Linux")) {
            os = "Linux";
        }

        return browser + ", " + os;
    }

    private void seedSampleRecords() {
        LocalDateTime now = LocalDateTime.now();
        Object[][] samples = {
                {"User superadmin@gmail.com logged in successfully", "superadmin@gmail.com",
                        "187.40.231.102", "Login", "Web", "Chrome 150.0.0.0, Windows 10", now.minusHours(1)},
                {"Student record viewed for admission 110025", "admin@gmail.com",
                        "192.168.0.101", "View", "Web", "Chrome 120.0.0.0, Windows 10", now.minusHours(2)},
                {"Fee payment collected for student std1", "accountant@gmail.com",
                        "192.168.0.102", "Create", "Web", "Firefox 115.0.0.0, Windows 10", now.minusHours(3)},
                {"Homework assignment updated", "teacher@gmail.com",
                        "192.168.0.103", "Update", "Web", "Chrome 119.0.0.0, Android", now.minusHours(4)},
                {"Library book issue recorded", "librarian@gmail.com",
                        "192.168.0.104", "Create", "Web", "Chrome 118.0.0.0, Windows 10", now.minusHours(5)},
                {"User std1 logged in successfully", "std1",
                        "192.168.0.153", "Login", "Web", "Chrome 81.0.4044.138, Android", now.minusHours(6)}
        };

        for (Object[] sample : samples) {
            AuditTrail record = AuditTrail.builder()
                    .message(String.valueOf(sample[0]))
                    .username(String.valueOf(sample[1]))
                    .ipAddress(String.valueOf(sample[2]))
                    .action(String.valueOf(sample[3]))
                    .platform(String.valueOf(sample[4]))
                    .agent(String.valueOf(sample[5]))
                    .eventDateTime((LocalDateTime) sample[6])
                    .build();
            auditTrailRepository.save(record);
        }
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
