package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ConferenceLiveMeeting;
import com.kantechsolution.smart_school.repository.ConferenceLiveMeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ConferenceLiveMeetingService implements ApplicationRunner {

    private static final DateTimeFormatter API_DATE_TIME = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
    private static final DateTimeFormatter INPUT_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    @Autowired
    private ConferenceLiveMeetingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        seedSampleData();
    }

    public List<Map<String, Object>> listAll() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (ConferenceLiveMeeting item : repository.findAllByOrderByMeetingDateTimeDescIdDesc()) {
            rows.add(toMap(item));
        }
        return rows;
    }

    public List<Map<String, Object>> listReport() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (ConferenceLiveMeeting item : repository.findAllByOrderByMeetingDateTimeDescIdDesc()) {
            rows.add(toReportMap(item));
        }
        return rows;
    }

    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("staff", staffList());
        options.put("statuses", List.of("Awaited", "Started", "Completed", "Cancelled"));
        options.put("defaultCreatedBy", "Self");
        options.put("defaultApiUsed", "Self");
        return options;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        String meetingTitle = text(body.get("meetingTitle"));
        if (meetingTitle.isBlank()) {
            throw new IllegalArgumentException("Meeting title is required");
        }

        String meetingDate = text(body.get("meetingDateTime"));
        if (meetingDate.isBlank()) {
            throw new IllegalArgumentException("Meeting date time is required");
        }

        Integer durationMinutes = parseInteger(body.get("durationMinutes"));
        if (durationMinutes == null || durationMinutes <= 0) {
            throw new IllegalArgumentException("Meeting duration is required");
        }

        List<String> staffIds = parseStaffIds(body.get("staffIds"));
        if (staffIds.isEmpty()) {
            throw new IllegalArgumentException("At least one staff member is required");
        }

        List<Map<String, Object>> selectedStaff = resolveStaffMembers(staffIds);

        ConferenceLiveMeeting item = new ConferenceLiveMeeting();
        item.setMeetingTitle(meetingTitle);
        item.setDescription(text(body.get("description")));
        item.setMeetingDateTime(parseDateTime(meetingDate));
        item.setDurationMinutes(durationMinutes);
        item.setHostVideo(asBoolean(body.get("hostVideo")));
        item.setClientVideo(asBoolean(body.get("clientVideo")));
        item.setApiUsed(text(body.get("apiUsed")).isBlank() ? "Self" : text(body.get("apiUsed")));
        item.setCreatedByLabel(text(body.get("createdByLabel")).isBlank() ? "Self" : text(body.get("createdByLabel")));
        item.setStaffIds(String.join(",", staffIds));
        item.setStaffMembers(formatStaffMembers(selectedStaff));
        item.setMeetingUrl("https://zoom.us/j/demo-" + System.currentTimeMillis());
        item.setStatus("Awaited");

        return toMap(repository.save(item));
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, Map<String, Object> body) {
        ConferenceLiveMeeting item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Live meeting not found"));

        String status = text(body.get("status"));
        if (status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        item.setStatus(status);
        return toMap(repository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        ConferenceLiveMeeting item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Live meeting not found"));
        repository.delete(item);
    }

    private List<Map<String, Object>> resolveStaffMembers(List<String> staffIds) {
        List<Map<String, Object>> selected = new ArrayList<>();
        for (String staffId : staffIds) {
            Map<String, Object> staff = staffList().stream()
                    .filter(item -> staffId.equals(String.valueOf(item.get("id"))))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Selected staff not found: " + staffId));
            selected.add(staff);
        }
        return selected;
    }

    private String formatStaffMembers(List<Map<String, Object>> staffMembers) {
        List<String> labels = new ArrayList<>();
        for (Map<String, Object> staff : staffMembers) {
            labels.add(String.valueOf(staff.get("label")));
        }
        return String.join("||", labels);
    }

    @SuppressWarnings("unchecked")
    private List<String> parseStaffIds(Object value) {
        if (value == null) {
            return List.of();
        }
        if (value instanceof Collection<?> collection) {
            List<String> ids = new ArrayList<>();
            for (Object item : collection) {
                String id = text(item);
                if (!id.isBlank()) {
                    ids.add(id);
                }
            }
            return ids;
        }
        String raw = text(value);
        if (raw.isBlank()) {
            return List.of();
        }
        List<String> ids = new ArrayList<>();
        for (String part : raw.split(",")) {
            if (!part.isBlank()) {
                ids.add(part.trim());
            }
        }
        return ids;
    }

    private List<Map<String, Object>> staffList() {
        List<Map<String, Object>> staff = new ArrayList<>();
        staff.add(staffOption("9002", "Shivam Verma", "Teacher"));
        staff.add(staffOption("9006", "Brandon Heart", "Librarian"));
        staff.add(staffOption("9003", "William Abbot", "Admin"));
        staff.add(staffOption("90006", "Jason Sharlton", "Teacher"));
        staff.add(staffOption("9008", "James Deckar", "Accountant"));
        staff.add(staffOption("9004", "Michael Chen", "Teacher"));
        staff.add(staffOption("9000", "Joe Black", "Super Admin"));
        return staff;
    }

    private Map<String, Object> staffOption(String id, String name, String role) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id);
        map.put("name", name);
        map.put("role", role);
        map.put("label", name + " (" + role + " : " + id + ")");
        return map;
    }

    private Map<String, Object> toMap(ConferenceLiveMeeting item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("meetingTitle", item.getMeetingTitle());
        map.put("description", item.getDescription());
        map.put("dateTime", item.getMeetingDateTime() == null ? "" : item.getMeetingDateTime().format(API_DATE_TIME));
        map.put("durationMinutes", item.getDurationMinutes());
        map.put("apiUsed", item.getApiUsed());
        map.put("createdBy", item.getCreatedByLabel());
        map.put("hostVideo", item.isHostVideo());
        map.put("clientVideo", item.isClientVideo());
        map.put("staffMembers", parseStaffMembers(item.getStaffMembers()));
        map.put("status", item.getStatus());
        map.put("meetingUrl", item.getMeetingUrl());
        return map;
    }

    private Map<String, Object> toReportMap(ConferenceLiveMeeting item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("meetingTitle", item.getMeetingTitle());
        map.put("description", item.getDescription());
        map.put("dateTime", item.getMeetingDateTime() == null ? "" : item.getMeetingDateTime().format(API_DATE_TIME));
        map.put("apiUsed", item.getApiUsed());
        map.put("createdBy", item.getCreatedByLabel());
        map.put("totalJoin", item.getTotalJoin() == null ? 0 : item.getTotalJoin());
        map.put("joinList", parseJoinList(item.getJoinList()));
        return map;
    }

    private List<Map<String, String>> parseJoinList(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        List<Map<String, String>> rows = new ArrayList<>();
        for (String part : value.split("\\|\\|")) {
            if (part.isBlank()) {
                continue;
            }
            String[] pieces = part.split("::", 3);
            Map<String, String> row = new LinkedHashMap<>();
            row.put("name", pieces.length > 0 ? pieces[0].trim() : "");
            row.put("role", pieces.length > 1 ? pieces[1].trim() : "");
            row.put("id", pieces.length > 2 ? pieces[2].trim() : "");
            rows.add(row);
        }
        return rows;
    }

    private List<String> parseStaffMembers(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        List<String> members = new ArrayList<>();
        for (String part : value.split("\\|\\|")) {
            if (!part.isBlank()) {
                members.add(part.trim());
            }
        }
        return members;
    }

    private LocalDateTime parseDateTime(String value) {
        try {
            if (value.contains("T")) {
                return LocalDateTime.parse(value, INPUT_DATE_TIME);
            }
            return LocalDateTime.parse(value, API_DATE_TIME);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid meeting date time format");
        }
    }

    private Integer parseInteger(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
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

    private void seedSampleData() {
        saveSeed(
                "Zoom Staff Meeting - April 2026",
                "",
                LocalDateTime.of(2026, 4, 15, 10, 0),
                45,
                "Global",
                "Shivam Verma (Teacher : 9002)||William Abbot (Admin : 9003)",
                "9002,9003",
                0,
                "",
                false,
                false,
                "Awaited"
        );
        saveSeed(
                "Parent Teacher Meeting",
                "Parent Teacher Meeting",
                LocalDateTime.of(2026, 3, 20, 14, 30),
                60,
                "Global",
                "Brandon Heart (Librarian : 9006)",
                "9006",
                1,
                "Brandon Heart::Librarian::9006",
                false,
                false,
                "Completed"
        );
        saveSeed(
                "Student Health Serve Mission",
                "Student Health Serve Mission",
                LocalDateTime.of(2026, 1, 5, 12, 0),
                30,
                "Global",
                "William Abbot (Admin : 9003)",
                "9003",
                1,
                "William Abbot::Admin::9003",
                false,
                false,
                "Completed"
        );
    }

    private void saveSeed(String title, String description, LocalDateTime dateTime, int duration,
                          String apiUsed, String staffMembers, String staffIds,
                          int totalJoin, String joinList,
                          boolean hostVideo, boolean clientVideo, String status) {
        ConferenceLiveMeeting item = new ConferenceLiveMeeting();
        item.setMeetingTitle(title);
        item.setDescription(description);
        item.setMeetingDateTime(dateTime);
        item.setDurationMinutes(duration);
        item.setApiUsed(apiUsed);
        item.setStaffMembers(staffMembers);
        item.setStaffIds(staffIds);
        item.setTotalJoin(totalJoin);
        item.setJoinList(joinList);
        item.setHostVideo(hostVideo);
        item.setClientVideo(clientVideo);
        item.setCreatedByLabel("Self");
        item.setMeetingUrl("https://zoom.us/j/demo-" + title.hashCode());
        item.setStatus(status);
        repository.save(item);
    }
}
