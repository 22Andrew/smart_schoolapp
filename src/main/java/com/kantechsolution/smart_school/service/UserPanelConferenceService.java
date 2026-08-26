package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserPanelConferenceService {

    private final UserPanelContextService contextService;
    private final ConferenceLiveClassService conferenceLiveClassService;

    public UserPanelConferenceService(UserPanelContextService contextService,
                                      ConferenceLiveClassService conferenceLiveClassService) {
        this.contextService = contextService;
        this.conferenceLiveClassService = conferenceLiveClassService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listLiveClasses(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String className = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getName()
                : "Class 1";
        String section = student != null && student.getSection() != null && !student.getSection().isBlank()
                ? student.getSection().trim()
                : "A";
        String classLabel = className + " (" + section + ")";

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> item : conferenceLiveClassService.listForClassSection(className, section)) {
            rows.add(toStudentRow(item, classLabel));
        }
        if (rows.isEmpty()) {
            rows.addAll(demoRows(classLabel));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("classLabel", classLabel);
        response.put("liveClasses", rows);
        return response;
    }

    private Map<String, Object> toStudentRow(Map<String, Object> item, String classLabel) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", item.get("id"));
        row.put("classTitle", text(item.get("classTitle")));
        row.put("dateTime", text(item.get("dateTime")));
        row.put("durationMinutes", item.get("durationMinutes"));
        row.put("classLabel", classLabel);
        row.put("classHost", text(item.get("createdFor")));
        row.put("description", text(item.get("description")));
        row.put("status", displayStatus(text(item.get("status"))));
        row.put("meetingUrl", text(item.get("meetingUrl")));
        return row;
    }

    private String displayStatus(String status) {
        if (status.isBlank()) {
            return "Awaited";
        }
        if ("Completed".equalsIgnoreCase(status)) {
            return "Finished";
        }
        return status;
    }

    private List<Map<String, Object>> demoRows(String classLabel) {
        return List.of(
                demoRow(1L, "Doubt Question Answer", "08/25/2026 10:32:00", 45, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Doubt Question Answer", "Awaited"),
                demoRow(2L, "Extra Class Social Studies", "08/25/2026 10:31:00", 60, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(3L, "Extra Class Social Studies", "08/25/2026 10:30:00", 45, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(4L, "Extra Class Social Studies", "08/25/2026 10:29:00", 45, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(5L, "Extra Class Social Studies", "08/25/2026 10:28:00", 45, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(6L, "Extra Class Social Studies", "08/25/2026 10:27:00", 60, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(7L, "Extra Class Social Studies", "08/25/2026 10:26:00", 60, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(8L, "Extra Class Social Studies", "08/25/2026 10:25:00", 45, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(9L, "Extra Class Social Studies", "04/25/2026 10:36:00", 45, classLabel,
                        "Shivam Verma (Teacher : 9002)", "Extra Class Social Studies", "Awaited"),
                demoRow(10L, "Computer Studies Classes", "04/25/2026 10:35:00", 45, classLabel,
                        "Nishant Khare (Teacher : 1002)", "", "Finished")
        );
    }

    private Map<String, Object> demoRow(Long id, String title, String dateTime, int duration,
                                        String classLabel, String host, String description, String status) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("classTitle", title);
        row.put("dateTime", dateTime);
        row.put("durationMinutes", duration);
        row.put("classLabel", classLabel);
        row.put("classHost", host);
        row.put("description", description);
        row.put("status", status);
        row.put("meetingUrl", "https://zoom.us/j/demo-" + id);
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
