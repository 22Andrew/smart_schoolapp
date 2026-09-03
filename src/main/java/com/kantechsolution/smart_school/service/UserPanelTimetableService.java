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
public class UserPanelTimetableService {

    private static final List<String> DAYS = List.of(
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    );

    private final UserPanelContextService contextService;
    private final ClassTimetableService classTimetableService;

    public UserPanelTimetableService(UserPanelContextService contextService,
                                     ClassTimetableService classTimetableService) {
        this.contextService = contextService;
        this.classTimetableService = classTimetableService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTimetable(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long classId = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getId()
                : null;
        String section = student != null && student.getSection() != null && !student.getSection().isBlank()
                ? student.getSection().trim()
                : "A";

        List<Map<String, Object>> periods = new ArrayList<>();
        if (classId != null) {
            try {
                for (Map<String, Object> row : classTimetableService.getTimetable(classId, section)) {
                    periods.add(toStudentPeriod(row));
                }
            } catch (IllegalArgumentException ignored) {
                periods = new ArrayList<>();
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("days", DAYS);
        response.put("periods", periods);
        return response;
    }

    private Map<String, Object> toStudentPeriod(Map<String, Object> row) {
        Map<String, Object> period = new LinkedHashMap<>();
        period.put("dayOfWeek", text(row.get("dayOfWeek")));
        period.put("subjectName", text(row.get("subjectName")));
        period.put("subjectCode", text(row.get("subjectCode")));
        period.put("timeFrom", text(row.get("timeFrom")));
        period.put("timeTo", text(row.get("timeTo")));
        period.put("teacherName", text(row.get("teacherName")));
        period.put("teacherId", text(row.get("teacherId")));
        period.put("roomNo", text(row.get("roomNo")));
        return period;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
