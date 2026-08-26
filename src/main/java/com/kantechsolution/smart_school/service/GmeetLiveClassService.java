package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.GmeetLiveClass;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.repository.GmeetLiveClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class GmeetLiveClassService implements ApplicationRunner {

    private static final DateTimeFormatter API_DATE_TIME = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
    private static final DateTimeFormatter INPUT_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    @Autowired
    private GmeetLiveClassRepository repository;

    @Autowired
    private SchoolClassService schoolClassService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() == 0) {
            seedSampleData();
            return;
        }
        ensureStudentDemoClasses();
    }

    public List<Map<String, Object>> listAll() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (GmeetLiveClass item : repository.findAllByOrderByClassDateTimeDescIdDesc()) {
            rows.add(toMap(item));
        }
        return rows;
    }

    public List<Map<String, Object>> listForClassSection(String className, String section) {
        String normalizedClassName = text(className);
        String normalizedSection = text(section);
        if (normalizedClassName.isBlank() || normalizedSection.isBlank()) {
            return List.of();
        }

        String classSectionToken = normalizedClassName + " (" + normalizedSection + ")";
        List<Map<String, Object>> rows = new ArrayList<>();
        for (GmeetLiveClass item : repository.findAllByOrderByClassDateTimeDescIdDesc()) {
            if (matchesClassSection(item, normalizedClassName, normalizedSection, classSectionToken)) {
                rows.add(toMap(item));
            }
        }
        return rows;
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
        for (GmeetLiveClass item : repository.findAllByOrderByClassDateTimeDescIdDesc()) {
            if (matchesClassSection(item, normalizedClassName, normalizedSection, classSectionToken)) {
                rows.add(toMap(item));
            }
        }
        return rows;
    }

    private boolean matchesClassSection(GmeetLiveClass item, String className, String section, String classSectionToken) {
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

    public Map<String, Object> formOptions() {
        Map<String, Object> options = new LinkedHashMap<>();

        options.put("roles", List.of("Teacher", "Super Admin", "Admin"));

        List<Map<String, Object>> staff = new ArrayList<>();
        staff.add(staffOption("9002", "Shivam Verma", "Teacher"));
        staff.add(staffOption("9003", "Sarah Johnson", "Teacher"));
        staff.add(staffOption("9004", "Michael Chen", "Teacher"));
        staff.add(staffOption("9000", "Joe Black", "Super Admin"));
        staff.add(staffOption("9001", "Emily Davis", "Admin"));
        options.put("staff", staff);

        options.put("classes", mapClasses(schoolClassService.getAllClasses()));
        options.put("statuses", List.of("Awaited", "Started", "Completed", "Cancelled"));

        options.put("defaultCreatedBy", Map.of(
                "name", "Joe Black",
                "role", "Super Admin",
                "id", "9000",
                "label", "Joe Black (Super Admin : 9000)"
        ));

        return options;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        String classTitle = text(body.get("classTitle"));
        if (classTitle.isBlank()) {
            throw new IllegalArgumentException("Class title is required");
        }

        String classDate = text(body.get("classDate"));
        if (classDate.isBlank()) {
            throw new IllegalArgumentException("Class date is required");
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

        String gmeetUrl = text(body.get("gmeetUrl"));
        if (gmeetUrl.isBlank()) {
            throw new IllegalArgumentException("Gmeet URL is required");
        }

        Map<String, Object> staff = resolveStaff(staffId);
        String classSectionLabel = className + " (" + section + ")";

        GmeetLiveClass item = new GmeetLiveClass();
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
        item.setGmeetUrl(gmeetUrl);
        item.setStatus("Awaited");

        applyCreatedBy(item, body);
        applyCreatedFor(item, staff);

        return toMap(repository.save(item));
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, Map<String, Object> body) {
        GmeetLiveClass item = repository.findById(id)
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
        GmeetLiveClass item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Live class not found"));
        repository.delete(item);
    }

    private void applyCreatedBy(GmeetLiveClass item, Map<String, Object> body) {
        String name = text(body.get("createdByName"));
        String role = text(body.get("createdByRole"));
        String id = text(body.get("createdById"));

        if (name.isBlank()) {
            name = "Joe Black";
        }
        if (role.isBlank()) {
            role = "Super Admin";
        }
        if (id.isBlank()) {
            id = "9000";
        }

        item.setCreatedByName(name);
        item.setCreatedByRole(role);
        item.setCreatedById(id);
    }

    private void applyCreatedFor(GmeetLiveClass item, Map<String, Object> staff) {
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
        staff.add(staffOption("9003", "Sarah Johnson", "Teacher"));
        staff.add(staffOption("9004", "Michael Chen", "Teacher"));
        staff.add(staffOption("9000", "Joe Black", "Super Admin"));
        staff.add(staffOption("9001", "Emily Davis", "Admin"));
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

    private Map<String, Object> toMap(GmeetLiveClass item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("classTitle", item.getClassTitle());
        map.put("description", item.getDescription());
        map.put("dateTime", item.getClassDateTime() == null ? "" : item.getClassDateTime().format(API_DATE_TIME));
        map.put("durationMinutes", item.getDurationMinutes());
        map.put("createdBy", formatPerson(item.getCreatedByName(), item.getCreatedByRole(), item.getCreatedById()));
        map.put("createdFor", formatPerson(item.getCreatedForName(), item.getCreatedForRole(), item.getCreatedForId()));
        map.put("classSections", parseClassSections(item.getClassSections()));
        map.put("status", item.getStatus());
        map.put("gmeetUrl", item.getGmeetUrl());
        map.put("role", item.getRole());
        map.put("staffId", item.getStaffId());
        map.put("className", item.getClassName());
        map.put("section", item.getSection());
        return map;
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
        String[] parts = value.split("\\|\\|");
        List<String> sections = new ArrayList<>();
        for (String part : parts) {
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
            throw new IllegalArgumentException("Invalid class date format");
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

    private void ensureStudentDemoClasses() {
        boolean hasGk = false;
        boolean hasExtra = false;
        String token = "Class 1 (A)";
        for (GmeetLiveClass item : repository.findAll()) {
            if (!matchesClassSection(item, "Class 1", "A", token)) {
                continue;
            }
            if ("GK Combined Online Classes".equals(item.getClassTitle())) {
                hasGk = true;
            }
            if ("Extra Practice Class".equals(item.getClassTitle())) {
                hasExtra = true;
            }
        }
        if (!hasGk) {
            saveSeed(
                    "GK Combined Online Classes",
                    "All Class 1 Combined",
                    LocalDateTime.of(2026, 8, 31, 17, 28),
                    25,
                    "Joe Black", "Super Admin", "9000",
                    "Shivam Verma", "Teacher", "9002",
                    "Class 1 (A)||Class 1 (B)||Class 1 (C)||Class 1 (D)||Class 1 (E)",
                    "https://meet.google.com/demo-gk-class",
                    "Awaited"
            );
        }
        if (!hasExtra) {
            saveSeed(
                    "Extra Practice Class",
                    "extra",
                    LocalDateTime.of(2026, 8, 31, 17, 25),
                    45,
                    "Joe Black", "Super Admin", "9000",
                    "Shivam Verma", "Teacher", "9002",
                    "Class 1 (A)",
                    "https://meet.google.com/demo-practice-class",
                    "Awaited"
            );
        }
    }

    private void seedSampleData() {
        saveSeed(
                "GK Combined Online Classes",
                "All Class 1 Combined",
                LocalDateTime.of(2026, 8, 31, 17, 28),
                25,
                "Joe Black", "Super Admin", "9000",
                "Shivam Verma", "Teacher", "9002",
                "Class 1 (A)||Class 1 (B)||Class 1 (C)||Class 1 (D)||Class 1 (E)",
                "https://meet.google.com/demo-gk-class",
                "Awaited"
        );
        saveSeed(
                "Extra Practice Class",
                "extra",
                LocalDateTime.of(2026, 8, 31, 17, 25),
                45,
                "Joe Black", "Super Admin", "9000",
                "Shivam Verma", "Teacher", "9002",
                "Class 1 (A)",
                "https://meet.google.com/demo-practice-class",
                "Awaited"
        );
        saveSeed(
                "Science Live Session",
                "Science Live Session",
                LocalDateTime.of(2026, 8, 29, 10, 15),
                20,
                "Joe Black", "Super Admin", "9000",
                "Michael Chen", "Teacher", "9004",
                "Class 3 (A)",
                "https://meet.google.com/demo-science-class",
                "Awaited"
        );
    }

    private void saveSeed(String title, String description, LocalDateTime dateTime, int duration,
                          String createdByName, String createdByRole, String createdById,
                          String createdForName, String createdForRole, String createdForId,
                          String classSections, String gmeetUrl, String status) {
        GmeetLiveClass item = new GmeetLiveClass();
        item.setClassTitle(title);
        item.setDescription(description);
        item.setClassDateTime(dateTime);
        item.setDurationMinutes(duration);
        item.setRole(createdForRole);
        item.setStaffName(createdForName);
        item.setStaffId(createdForId);
        item.setClassSections(classSections);
        if (classSections != null && classSections.contains("(")) {
            String first = classSections.split("\\|\\|")[0].trim();
            int open = first.lastIndexOf('(');
            int close = first.lastIndexOf(')');
            if (open > 0 && close > open) {
                item.setClassName(first.substring(0, open).trim());
                item.setSection(first.substring(open + 1, close).trim());
            }
        }
        item.setCreatedByName(createdByName);
        item.setCreatedByRole(createdByRole);
        item.setCreatedById(createdById);
        item.setCreatedForName(createdForName);
        item.setCreatedForRole(createdForRole);
        item.setCreatedForId(createdForId);
        item.setGmeetUrl(gmeetUrl);
        item.setStatus(status);
        repository.save(item);
    }
}
