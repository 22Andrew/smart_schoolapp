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
public class UserPanelGmeetService {

    private final UserPanelContextService contextService;
    private final GmeetLiveClassService gmeetLiveClassService;

    public UserPanelGmeetService(UserPanelContextService contextService,
                                 GmeetLiveClassService gmeetLiveClassService) {
        this.contextService = contextService;
        this.gmeetLiveClassService = gmeetLiveClassService;
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
        for (Map<String, Object> item : gmeetLiveClassService.listForClassSection(className, section)) {
            rows.add(toStudentRow(item, classLabel));
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
        row.put("status", text(item.get("status")).isBlank() ? "Awaited" : text(item.get("status")));
        row.put("gmeetUrl", text(item.get("gmeetUrl")));
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
