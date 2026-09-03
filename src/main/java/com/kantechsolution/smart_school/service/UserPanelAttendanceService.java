package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import com.kantechsolution.smart_school.repository.StudentAttendanceEntryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.util.*;

@Service
public class UserPanelAttendanceService {

    private final UserPanelContextService userPanelContextService;
    private final AcademicSessionService academicSessionService;
    private final StudentAttendanceEntryRepository attendanceEntryRepository;
    private final StudentAttendanceProfileSeedService attendanceSeedService;

    public UserPanelAttendanceService(
            UserPanelContextService userPanelContextService,
            AcademicSessionService academicSessionService,
            StudentAttendanceEntryRepository attendanceEntryRepository,
            StudentAttendanceProfileSeedService attendanceSeedService
    ) {
        this.userPanelContextService = userPanelContextService;
        this.academicSessionService = academicSessionService;
        this.attendanceEntryRepository = attendanceEntryRepository;
        this.attendanceSeedService = attendanceSeedService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMonthCalendar(Authentication authentication, Integer year, Integer month) {
        StudentAdmission student = requireStudent(authentication);
        LocalDate today = LocalDate.now();
        int resolvedYear = year == null ? today.getYear() : year;
        int resolvedMonth = month == null ? today.getMonthValue() : month;
        if (resolvedMonth < 1 || resolvedMonth > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }

        YearMonth yearMonth = YearMonth.of(resolvedYear, resolvedMonth);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();
        LocalDate gridStart = monthStart.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate gridEnd = monthEnd.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

        List<StudentAttendanceEntry> entries = attendanceEntryRepository.findByStudentAndDateRange(
                student.getId(), gridStart, gridEnd);
        Map<LocalDate, StudentAttendanceEntry> byDate = new HashMap<>();
        for (StudentAttendanceEntry entry : entries) {
            if (entry.getAttendanceDate() != null) {
                byDate.put(entry.getAttendanceDate(), entry);
            }
        }

        List<Map<String, Object>> days = new ArrayList<>();
        for (LocalDate date = gridStart; !date.isAfter(gridEnd); date = date.plusDays(1)) {
            StudentAttendanceEntry entry = byDate.get(date);
            String code = entry == null ? "" : StudentAttendanceProfileSeedService.statusToCode(entry.getStatus());
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", date.toString());
            day.put("day", date.getDayOfMonth());
            day.put("inMonth", date.getMonthValue() == resolvedMonth);
            day.put("code", code);
            day.put("status", statusLabel(code));
            days.add(day);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("year", resolvedYear);
        response.put("month", resolvedMonth);
        response.put("monthLabel", yearMonth.getMonth().getDisplayName(java.time.format.TextStyle.FULL, Locale.US)
                + " " + resolvedYear);
        response.put("days", days);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfileAttendance(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);
        String sessionName = academicSessionService.getCurrentSessionName();
        int startYear = StudentAttendanceProfileSeedService.parseSessionStartYear(sessionName);
        int endYear = startYear + 1;

        LocalDate sessionStart = LocalDate.of(startYear, Month.APRIL, 1);
        LocalDate sessionEnd = LocalDate.of(endYear, Month.MARCH, 31);

        List<StudentAttendanceEntry> entries = attendanceEntryRepository.findByStudentAndDateRange(
                student.getId(), sessionStart, sessionEnd);

        List<Map<String, Object>> months = buildSessionMonths(startYear, endYear);
        Map<String, Map<Integer, String>> data = buildAttendanceGrid(entries, months);
        Map<String, Integer> summary = countAttendance(data);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("sessionName", sessionName);
        response.put("summary", summary);
        response.put("months", months);
        response.put("data", data);
        return response;
    }

    private List<Map<String, Object>> buildSessionMonths(int startYear, int endYear) {
        List<MonthDef> defs = List.of(
                new MonthDef("apr", "April", Month.APRIL, startYear),
                new MonthDef("may", "May", Month.MAY, startYear),
                new MonthDef("jun", "June", Month.JUNE, startYear),
                new MonthDef("jul", "July", Month.JULY, startYear),
                new MonthDef("aug", "August", Month.AUGUST, startYear),
                new MonthDef("sep", "September", Month.SEPTEMBER, startYear),
                new MonthDef("oct", "October", Month.OCTOBER, startYear),
                new MonthDef("nov", "November", Month.NOVEMBER, startYear),
                new MonthDef("dec", "December", Month.DECEMBER, startYear),
                new MonthDef("jan", "January", Month.JANUARY, endYear),
                new MonthDef("feb", "February", Month.FEBRUARY, endYear),
                new MonthDef("mar", "March", Month.MARCH, endYear)
        );

        List<Map<String, Object>> months = new ArrayList<>();
        for (MonthDef def : defs) {
            Map<String, Object> month = new LinkedHashMap<>();
            month.put("key", def.key());
            month.put("label", def.label());
            month.put("monthIndex", def.month().getValue() - 1);
            month.put("year", def.year());
            months.add(month);
        }
        return months;
    }

    private Map<String, Map<Integer, String>> buildAttendanceGrid(
            List<StudentAttendanceEntry> entries,
            List<Map<String, Object>> months
    ) {
        Map<String, String> monthKeyByYearMonth = new HashMap<>();
        for (Map<String, Object> month : months) {
            int year = ((Number) month.get("year")).intValue();
            int monthIndex = ((Number) month.get("monthIndex")).intValue();
            monthKeyByYearMonth.put(year + "-" + monthIndex, String.valueOf(month.get("key")));
        }

        Map<String, Map<Integer, String>> data = new LinkedHashMap<>();
        for (Map<String, Object> month : months) {
            data.put(String.valueOf(month.get("key")), new LinkedHashMap<>());
        }

        for (StudentAttendanceEntry entry : entries) {
            LocalDate date = entry.getAttendanceDate();
            if (date == null) {
                continue;
            }
            String monthKey = monthKeyByYearMonth.get(date.getYear() + "-" + (date.getMonthValue() - 1));
            if (monthKey == null) {
                continue;
            }
            String code = StudentAttendanceProfileSeedService.statusToCode(entry.getStatus());
            if (!code.isBlank()) {
                data.get(monthKey).put(date.getDayOfMonth(), code);
            }
        }
        return data;
    }

    private Map<String, Integer> countAttendance(Map<String, Map<Integer, String>> data) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        counts.put("present", 0);
        counts.put("late", 0);
        counts.put("absent", 0);
        counts.put("halfDay", 0);
        counts.put("holiday", 0);
        counts.put("lateExcuse", 0);

        for (Map<Integer, String> monthData : data.values()) {
            for (String code : monthData.values()) {
                switch (String.valueOf(code).toUpperCase(Locale.ROOT)) {
                    case "P" -> counts.put("present", counts.get("present") + 1);
                    case "L" -> counts.put("late", counts.get("late") + 1);
                    case "A" -> counts.put("absent", counts.get("absent") + 1);
                    case "F" -> counts.put("halfDay", counts.get("halfDay") + 1);
                    case "H" -> counts.put("holiday", counts.get("holiday") + 1);
                    case "E" -> counts.put("lateExcuse", counts.get("lateExcuse") + 1);
                    default -> {
                    }
                }
            }
        }
        return counts;
    }

    private String statusLabel(String code) {
        return switch (String.valueOf(code).toUpperCase(Locale.ROOT)) {
            case "P" -> "Present";
            case "A" -> "Absent";
            case "F" -> "Half Day";
            case "L" -> "Late";
            case "H" -> "Holiday";
            case "E" -> "Late With Excuse";
            default -> "";
        };
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }

    private record MonthDef(String key, String label, Month month, int year) {
    }
}
