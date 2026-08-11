package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ConferenceLiveClass;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.repository.ConferenceLiveClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ConferenceLiveClassService implements ApplicationRunner {

    private static final DateTimeFormatter API_DATE_TIME = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
    private static final DateTimeFormatter INPUT_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    @Autowired
    private ConferenceLiveClassRepository repository;

    @Autowired
    private SchoolClassService schoolClassService;

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
        for (ConferenceLiveClass item : repository.findAllByOrderByClassDateTimeDescIdDesc()) {
            rows.add(toMap(item));
        }
        return rows;
    }

    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("roles", List.of("Teacher", "Super Admin", "Admin", "Librarian", "Accountant"));
        options.put("staff", staffList());
        options.put("classes", mapClasses(schoolClassService.getAllClasses()));
        options.put("statuses", List.of("Awaited", "Started", "Completed", "Cancelled"));
        options.put("defaultCreatedBy", "Self");
        options.put("defaultApiUsed", "Global");
        return options;
    }

    public List<Map<String, Object>> searchReport(String className, String section) {
        if (text(className).isBlank()) {
            throw new IllegalArgumentException("Class is required");
        }
        if (text(section).isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        String normalizedClassName = text(className);
        String normalizedSection = text(section);
        String classSectionToken = normalizedClassName + " (" + normalizedSection + ")";

        List<Map<String, Object>> rows = new ArrayList<>();
        for (ConferenceLiveClass item : repository.findAllByOrderByClassDateTimeDescIdDesc()) {
            if (matchesClassSection(item, normalizedClassName, normalizedSection, classSectionToken)) {
                rows.add(toReportMap(item));
            }
        }
        return rows;
    }

    private boolean matchesClassSection(ConferenceLiveClass item, String className, String section, String classSectionToken) {
        if (className.equalsIgnoreCase(text(item.getClassName()))
                && section.equalsIgnoreCase(text(item.getSection()))) {
            return true;
        }
        String classSections = item.getClassSections();
        if (classSections == null || classSections.isBlank()) {
            return false;
        }
        for (String part : classSections.split("\\|\\|")) {
            if (classSectionToken.equalsIgnoreCase(part.trim())) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        String classTitle = text(body.get("classTitle"));
        if (classTitle.isBlank()) {
            throw new IllegalArgumentException("Class title is required");
        }

        String classDate = text(body.get("classDate"));
        if (classDate.isBlank()) {
            classDate = text(body.get("classDateTime"));
        }
        if (classDate.isBlank()) {
            throw new IllegalArgumentException("Class date time is required");
        }

        Integer durationMinutes = parseInteger(body.get("durationMinutes"));
        if (durationMinutes == null || durationMinutes <= 0) {
            throw new IllegalArgumentException("Class duration is required");
        }

        String role = text(body.get("role"));
        if (role.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        String staffId = text(body.get("staffId"));
        if (staffId.isBlank()) {
            throw new IllegalArgumentException("Staff is required");
        }

        String className = text(body.get("className"));
        Long classId = parseLong(body.get("classId"));
        SchoolClass schoolClass = resolveSchoolClass(classId, className);

        String section = text(body.get("section"));
        if (section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        validateSection(schoolClass, section);
        className = schoolClass.getName();

        Map<String, Object> staff = resolveStaff(staffId);
        String classSectionLabel = className + " (" + section + ")";

        ConferenceLiveClass item = new ConferenceLiveClass();
        item.setClassTitle(classTitle);
        item.setDescription(text(body.get("description")));
        item.setClassDateTime(parseDateTime(classDate));
        item.setDurationMinutes(durationMinutes);
        item.setRole(role);
        item.setStaffName(text(staff.get("name")));
        item.setStaffId(staffId);
        item.setClassName(className);
        item.setSection(section);
        item.setClassSections(classSectionLabel);
        item.setHostVideo(asBoolean(body.get("hostVideo")));
        item.setClientVideo(asBoolean(body.get("clientVideo")));
        item.setApiUsed(text(body.get("apiUsed")).isBlank() ? "Global" : text(body.get("apiUsed")));
        item.setCreatedByLabel(text(body.get("createdByLabel")).isBlank() ? "Self" : text(body.get("createdByLabel")));
        item.setMeetingUrl("https://zoom.us/j/demo-class-" + System.currentTimeMillis());
        item.setStatus("Awaited");
        applyCreatedFor(item, staff);

        return toMap(repository.save(item));
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, Map<String, Object> body) {
        ConferenceLiveClass item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Live class not found"));

        String status = text(body.get("status"));
        if (status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        item.setStatus(status);
        return toMap(repository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        ConferenceLiveClass item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Live class not found"));
        repository.delete(item);
    }

    private void applyCreatedFor(ConferenceLiveClass item, Map<String, Object> staff) {
        item.setCreatedForName(text(staff.get("name")));
        item.setCreatedForRole(text(staff.get("role")));
        item.setCreatedForId(text(staff.get("id")));
    }

    private Map<String, Object> resolveStaff(String staffId) {
        for (Map<String, Object> staff : staffList()) {
            if (staffId.equals(String.valueOf(staff.get("id")))) {
                return staff;
            }
        }
        throw new IllegalArgumentException("Selected staff not found");
    }

    private List<Map<String, Object>> staffList() {
        List<Map<String, Object>> staff = new ArrayList<>();
        staff.add(staffOption("9002", "Shivam Verma", "Teacher"));
        staff.add(staffOption("9003", "William Abbot", "Admin"));
        staff.add(staffOption("9004", "Michael Chen", "Teacher"));
        staff.add(staffOption("9006", "Brandon Heart", "Librarian"));
        staff.add(staffOption("9008", "James Deckar", "Accountant"));
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

    private List<Map<String, Object>> mapClasses(List<SchoolClass> classes) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (SchoolClass schoolClass : classes) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", schoolClass.getId());
            row.put("name", schoolClass.getName());
            row.put("sections", schoolClass.getSections() != null ? schoolClass.getSections() : List.of());
            rows.add(row);
        }
        return rows;
    }

    private SchoolClass resolveSchoolClass(Long classId, String className) {
        if (classId != null) {
            return schoolClassService.getClassById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));
        }
        if (!className.isBlank()) {
            return schoolClassService.getAllClasses().stream()
                    .filter(item -> className.equalsIgnoreCase(item.getName()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));
        }
        throw new IllegalArgumentException("Class is required");
    }

    private void validateSection(SchoolClass schoolClass, String section) {
        boolean sectionAllowed = schoolClass.getSections() != null && schoolClass.getSections().stream()
                .anyMatch(value -> value != null && value.equalsIgnoreCase(section));
        if (!sectionAllowed) {
            throw new IllegalArgumentException("Section " + section + " is not available for the selected class");
        }
    }

    private Map<String, Object> toMap(ConferenceLiveClass item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("classTitle", item.getClassTitle());
        map.put("description", item.getDescription());
        map.put("dateTime", item.getClassDateTime() == null ? "" : item.getClassDateTime().format(API_DATE_TIME));
        map.put("durationMinutes", item.getDurationMinutes());
        map.put("apiUsed", item.getApiUsed());
        map.put("createdBy", item.getCreatedByLabel());
        map.put("createdFor", formatPerson(item.getCreatedForName(), item.getCreatedForRole(), item.getCreatedForId()));
        map.put("classSections", parseClassSections(item.getClassSections()));
        map.put("hostVideo", item.isHostVideo());
        map.put("clientVideo", item.isClientVideo());
        map.put("status", item.getStatus());
        map.put("meetingUrl", item.getMeetingUrl());
        map.put("role", item.getRole());
        map.put("staffId", item.getStaffId());
        map.put("className", item.getClassName());
        map.put("section", item.getSection());
        return map;
    }

    private Map<String, Object> toReportMap(ConferenceLiveClass item) {
        Map<String, Object> map = toMap(item);
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

    private String formatPerson(String name, String role, String id) {
        if (name == null || name.isBlank()) {
            return "";
        }
        return name + " (" + (role == null ? "" : role) + " : " + (id == null ? "" : id) + ")";
    }

    private List<String> parseClassSections(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        List<String> sections = new ArrayList<>();
        for (String part : value.split("\\|\\|")) {
            if (!part.isBlank()) {
                sections.add(part.trim());
            }
        }
        return sections;
    }

    private LocalDateTime parseDateTime(String value) {
        try {
            if (value.contains("T")) {
                return LocalDateTime.parse(value, INPUT_DATE_TIME);
            }
            return LocalDateTime.parse(value, API_DATE_TIME);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid class date time format");
        }
    }

    private Long parseLong(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException ex) {
            return null;
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
                "Computer Studies Classes",
                "",
                LocalDateTime.of(2026, 4, 25, 10, 35),
                45,
                "Global",
                "Nishant Khare", "Teacher", "1002",
                "Class 1", "A",
                "Class 1 (A)",
                0,
                "",
                false,
                false,
                "Awaited"
        );
        saveSeed(
                "Doubt Question Answer",
                "Doubt Question Answer",
                LocalDateTime.of(2026, 8, 31, 17, 28),
                45,
                "Global",
                "Shivam Verma", "Teacher", "9002",
                "Class 1", "A",
                "Class 1 (A)||Class 1 (B)||Class 1 (C)||Class 1 (D)||Class 1 (E)",
                0,
                "",
                false,
                false,
                "Awaited"
        );
        saveSeed(
                "Extra Class Social Studies",
                "Extra Class Social Studies",
                LocalDateTime.of(2026, 8, 30, 15, 0),
                60,
                "Global",
                "Shivam Verma", "Teacher", "9002",
                "Class 2", "A",
                "Class 2 (A)||Class 2 (B)",
                0,
                "",
                false,
                false,
                "Awaited"
        );
    }

    private void saveSeed(String title, String description, LocalDateTime dateTime, int duration,
                          String apiUsed, String createdForName, String createdForRole, String createdForId,
                          String className, String section, String classSections,
                          int totalJoin, String joinList,
                          boolean hostVideo, boolean clientVideo, String status) {
        ConferenceLiveClass item = new ConferenceLiveClass();
        item.setClassTitle(title);
        item.setDescription(description);
        item.setClassDateTime(dateTime);
        item.setDurationMinutes(duration);
        item.setApiUsed(apiUsed);
        item.setCreatedByLabel("Self");
        item.setCreatedForName(createdForName);
        item.setCreatedForRole(createdForRole);
        item.setCreatedForId(createdForId);
        item.setRole(createdForRole);
        item.setStaffName(createdForName);
        item.setStaffId(createdForId);
        item.setClassName(className);
        item.setSection(section);
        item.setClassSections(classSections);
        item.setTotalJoin(totalJoin);
        item.setJoinList(joinList);
        item.setHostVideo(hostVideo);
        item.setClientVideo(clientVideo);
        item.setMeetingUrl("https://zoom.us/j/demo-" + title.hashCode());
        item.setStatus(status);
        repository.save(item);
    }
}
