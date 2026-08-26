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
        if (periods.isEmpty()) {
            periods.addAll(demoPeriods());
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

    private List<Map<String, Object>> demoPeriods() {
        List<Map<String, Object>> rows = new ArrayList<>();
        addDay(rows, "Monday",
                period("English", "210", "08:00", "08:45", "Shivam Verma", "9002", "100"),
                period("Mathematics", "110", "08:45", "09:30", "Joe Black", "9000", "101"),
                period("Science", "111", "09:30", "10:15", "Shivam Verma", "9002", "102"));
        addDay(rows, "Tuesday",
                period("Hindi", "230", "08:00", "08:45", "Shivam Verma", "9002", "100"),
                period("English", "210", "08:45", "09:30", "Shivam Verma", "9002", "100"),
                period("Mathematics", "110", "09:30", "10:15", "Joe Black", "9000", "101"));
        addDay(rows, "Wednesday",
                period("Science", "111", "08:00", "08:45", "Shivam Verma", "9002", "102"),
                period("Social Studies", "212", "08:45", "09:30", "Joe Black", "9000", "104"),
                period("English", "210", "09:30", "10:15", "Shivam Verma", "9002", "100"));
        addDay(rows, "Thursday",
                period("Mathematics", "110", "08:00", "08:45", "Joe Black", "9000", "101"),
                period("Hindi", "230", "08:45", "09:30", "Shivam Verma", "9002", "100"),
                period("Science", "111", "09:30", "10:15", "Shivam Verma", "9002", "102"));
        addDay(rows, "Friday",
                period("English", "210", "08:00", "08:45", "Shivam Verma", "9002", "100"),
                period("Social Studies", "212", "08:45", "09:30", "Joe Black", "9000", "104"),
                period("Mathematics", "110", "09:30", "10:15", "Joe Black", "9000", "101"));
        addDay(rows, "Saturday",
                period("Science", "111", "08:00", "08:45", "Shivam Verma", "9002", "102"),
                period("English", "210", "08:45", "09:30", "Shivam Verma", "9002", "100"),
                period("Hindi", "230", "09:30", "10:15", "Shivam Verma", "9002", "100"));
        return rows;
    }

    @SafeVarargs
    private void addDay(List<Map<String, Object>> rows, String day, Map<String, Object>... periods) {
        for (Map<String, Object> period : periods) {
            period.put("dayOfWeek", day);
            rows.add(period);
        }
    }

    private Map<String, Object> period(String subjectName, String subjectCode, String timeFrom, String timeTo,
                                       String teacherName, String teacherId, String roomNo) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("subjectName", subjectName);
        row.put("subjectCode", subjectCode);
        row.put("timeFrom", timeFrom);
        row.put("timeTo", timeTo);
        row.put("teacherName", teacherName);
        row.put("teacherId", teacherId);
        row.put("roomNo", roomNo);
        return row;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
