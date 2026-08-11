package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.GmeetLiveMeeting;
import com.kantechsolution.smart_school.repository.GmeetLiveMeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class GmeetLiveMeetingService implements ApplicationRunner {

    private static final DateTimeFormatter API_DATE_TIME = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
    private static final DateTimeFormatter INPUT_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    @Autowired
    private GmeetLiveMeetingRepository repository;

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
        for (GmeetLiveMeeting item : repository.findAllByOrderByMeetingDateTimeDescIdDesc()) {
            rows.add(toMap(item));
        }
        return rows;
    }

    public List<Map<String, Object>> listReport() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (GmeetLiveMeeting item : repository.findAllByOrderByMeetingDateTimeDescIdDesc()) {
            rows.add(toReportMap(item));
        }
        return rows;
    }

    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("staff", staffList());
        options.put("statuses", List.of("Awaited", "Started", "Completed", "Cancelled"));
        options.put("defaultCreatedBy", "Self");
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

        String gmeetUrl = text(body.get("gmeetUrl"));
        if (gmeetUrl.isBlank()) {
            throw new IllegalArgumentException("Gmeet URL is required");
        }

        List<String> staffIds = parseStaffIds(body.get("staffIds"));
        if (staffIds.isEmpty()) {
            throw new IllegalArgumentException("At least one staff member is required");
        }

        List<Map<String, Object>> selectedStaff = resolveStaffMembers(staffIds);

        GmeetLiveMeeting item = new GmeetLiveMeeting();
        item.setMeetingTitle(meetingTitle);
        item.setDescription(text(body.get("description")));
        item.setMeetingDateTime(parseDateTime(meetingDate));
        item.setDurationMinutes(durationMinutes);
        item.setGmeetUrl(gmeetUrl);
        item.setCreatedByLabel(text(body.get("createdByLabel")).isBlank() ? "Self" : text(body.get("createdByLabel")));
        item.setStaffIds(String.join(",", staffIds));
        item.setStaffMembers(formatStaffMembers(selectedStaff));
        item.setStatus("Awaited");

        return toMap(repository.save(item));
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, Map<String, Object> body) {
        GmeetLiveMeeting item = repository.findById(id)
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
        GmeetLiveMeeting item = repository.findById(id)
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
        String[] parts = raw.split(",");
        List<String> ids = new ArrayList<>();
        for (String part : parts) {
            if (!part.isBlank()) {
                ids.add(part.trim());
            }
        }
        return ids;
    }

    private List<Map<String, Object>> staffList() {
        List<Map<String, Object>> staff = new ArrayList<>();
        staff.add(staffOption("9002", "Shivam Verma", "Teacher"));
        staff.add(staffOption("9003", "William Abbot", "Admin"));
        staff.add(staffOption("9004", "Michael Chen", "Teacher"));
        staff.add(staffOption("654", "Aman Verma", "Teacher"));
        staff.add(staffOption("1002", "Nishant Khare", "Teacher"));
        staff.add(staffOption("9005", "James Anderson", "Teacher"));
        staff.add(staffOption("90006", "Jason Sharlton", "Teacher"));
        staff.add(staffOption("9000", "Joe Black", "Super Admin"));
        staff.add(staffOption("9001", "Emily Davis", "Admin"));
        staff.add(staffOption("9007", "Maria Lopez", "Librarian"));
        staff.add(staffOption("9008", "David Wilson", "Accountant"));
        staff.add(staffOption("9009", "Anna Brown", "Receptionist"));
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

    private Map<String, Object> toMap(GmeetLiveMeeting item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("meetingTitle", item.getMeetingTitle());
        map.put("description", item.getDescription());
        map.put("dateTime", item.getMeetingDateTime() == null ? "" : item.getMeetingDateTime().format(API_DATE_TIME));
        map.put("durationMinutes", item.getDurationMinutes());
        map.put("createdBy", item.getCreatedByLabel());
        map.put("staffMembers", parseStaffMembers(item.getStaffMembers()));
        map.put("invitedStaff", buildInvitedStaff(item));
        map.put("status", item.getStatus());
        map.put("gmeetUrl", item.getGmeetUrl());
        return map;
    }

    private Map<String, Object> toReportMap(GmeetLiveMeeting item) {
        List<Map<String, Object>> invitedStaff = buildInvitedStaff(item);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("meetingTitle", item.getMeetingTitle());
        map.put("description", item.getDescription());
        map.put("dateTime", item.getMeetingDateTime() == null ? "" : item.getMeetingDateTime().format(API_DATE_TIME));
        map.put("createdBy", item.getCreatedByLabel());
        map.put("totalJoin", invitedStaff.size());
        map.put("invitedStaff", invitedStaff);
        return map;
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

    private List<Map<String, Object>> buildInvitedStaff(GmeetLiveMeeting item) {
        List<Map<String, Object>> rows = new ArrayList<>();
        if (item.getStaffIds() != null && !item.getStaffIds().isBlank()) {
            for (String staffId : item.getStaffIds().split(",")) {
                String id = staffId.trim();
                if (id.isEmpty()) {
                    continue;
                }
                staffList().stream()
                        .filter(staff -> id.equals(String.valueOf(staff.get("id"))))
                        .findFirst()
                        .ifPresent(staff -> rows.add(toInvitedStaffRow(staff)));
            }
        }
        if (!rows.isEmpty()) {
            return rows;
        }
        for (String label : parseStaffMembers(item.getStaffMembers())) {
            rows.add(parseInvitedStaffLabel(label));
        }
        return rows;
    }

    private Map<String, Object> toInvitedStaffRow(Map<String, Object> staff) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("staff", staff.get("name"));
        row.put("staffId", staff.get("id"));
        row.put("role", staff.get("role"));
        return row;
    }

    private Map<String, Object> parseInvitedStaffLabel(String label) {
        Map<String, Object> row = new LinkedHashMap<>();
        String value = label == null ? "" : label.trim();
        int open = value.lastIndexOf('(');
        int colon = value.lastIndexOf(':');
        int close = value.lastIndexOf(')');
        if (open > 0 && colon > open && close > colon) {
            row.put("staff", value.substring(0, open).trim());
            row.put("role", value.substring(open + 1, colon).trim());
            row.put("staffId", value.substring(colon + 1, close).trim());
        } else {
            row.put("staff", value);
            row.put("staffId", "");
            row.put("role", "");
        }
        return row;
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

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private void seedSampleData() {
        saveSeed(
                "Online Teacher Training Meeting",
                "Online Teacher Training Meeting",
                LocalDateTime.of(2026, 8, 31, 17, 33),
                36,
                "William Abbot (Admin : 9003)||Jason Sharlton (Teacher : 90006)||Nishant Khare (Teacher : 1002)||Aman Verma (Teacher : 654)",
                "9003,90006,1002,654",
                "https://meet.google.com/demo-teacher-training",
                "Awaited"
        );
        saveSeed(
                "Monthly staff meeting",
                "Monthly staff meeting",
                LocalDateTime.of(2026, 8, 30, 14, 0),
                25,
                "Joe Black (Super Admin : 9000)||Emily Davis (Admin : 9001)||David Wilson (Accountant : 9008)",
                "9000,9001,9008",
                "https://meet.google.com/demo-staff-meeting",
                "Awaited"
        );
        saveSeed(
                "Parent Orientation Session",
                "Parent Orientation Session",
                LocalDateTime.of(2026, 8, 29, 11, 15),
                34,
                "James Anderson (Teacher : 9005)||Maria Lopez (Librarian : 9007)",
                "9005,9007",
                "https://meet.google.com/demo-parent-orientation",
                "Awaited"
        );
        saveSeed(
                "Student Health Serve Mission",
                "Student Health Serve Mission",
                LocalDateTime.of(2026, 1, 5, 12, 0),
                30,
                "William Abbot (Admin : 9003)",
                "9003",
                "https://meet.google.com/demo-student-health",
                "Completed"
        );
    }

    private void saveSeed(String title, String description, LocalDateTime dateTime, int duration,
                          String staffMembers, String staffIds, String gmeetUrl, String status) {
        GmeetLiveMeeting item = new GmeetLiveMeeting();
        item.setMeetingTitle(title);
        item.setDescription(description);
        item.setMeetingDateTime(dateTime);
        item.setDurationMinutes(duration);
        item.setStaffMembers(staffMembers);
        item.setStaffIds(staffIds);
        item.setGmeetUrl(gmeetUrl);
        item.setCreatedByLabel("Self");
        item.setStatus(status);
        repository.save(item);
    }
}
