package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.LessonPlanSchedule;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.LessonPlanScheduleRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelSyllabusService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final LocalDate STUDENT_DEMO_WEEK = LocalDate.of(2026, 8, 24);
    private static final List<String> DAYS = List.of(
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    );

    private final UserPanelContextService contextService;
    private final LessonPlanScheduleService scheduleService;
    private final LessonPlanScheduleRepository scheduleRepository;
    private final LessonPlanViewService viewService;

    public UserPanelSyllabusService(UserPanelContextService contextService,
                                    LessonPlanScheduleService scheduleService,
                                    LessonPlanScheduleRepository scheduleRepository,
                                    LessonPlanViewService viewService) {
        this.contextService = contextService;
        this.scheduleService = scheduleService;
        this.scheduleRepository = scheduleRepository;
        this.viewService = viewService;
    }

    @Transactional
    public Map<String, Object> getWeek(Authentication authentication, LocalDate weekStart) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String className = resolveClassName(student);
        String section = resolveSection(student);
        Long classId = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getId()
                : null;
        LocalDate start = normalizeWeekStart(weekStart);

        if (start.equals(STUDENT_DEMO_WEEK)) {
            scheduleService.ensureWeekForClass(className, section, start, classId);
        }

        List<Map<String, Object>> schedules = scheduleService.getWeeklyScheduleForClass(className, section, start);
        LocalDate end = start.plusDays(6);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("weekStart", start.toString());
        response.put("weekEnd", end.toString());
        response.put("weekLabel", start.format(US_DATE) + " To " + end.format(US_DATE));
        response.put("days", buildDays(start));
        response.put("schedules", schedules);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getViewData(Authentication authentication, Long scheduleId) {
        requireOwnedSchedule(authentication, scheduleId);
        return viewService.getViewData(scheduleId);
    }

    @Transactional
    public Map<String, Object> addComment(Authentication authentication, Long scheduleId, Map<String, Object> payload) {
        requireOwnedSchedule(authentication, scheduleId);
        Map<String, Object> saved = viewService.addComment(scheduleId, payload);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Comment added successfully!");
        response.put("data", saved);
        return response;
    }

    private LessonPlanSchedule requireOwnedSchedule(Authentication authentication, Long scheduleId) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        LessonPlanSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson plan not found"));
        String className = resolveClassName(student);
        String section = resolveSection(student);
        if (!className.equalsIgnoreCase(schedule.getClassName())
                || !section.equalsIgnoreCase(schedule.getSection())) {
            throw new IllegalArgumentException("Lesson plan not found");
        }
        return schedule;
    }

    private List<Map<String, Object>> buildDays(LocalDate weekStart) {
        List<Map<String, Object>> days = new ArrayList<>();
        for (int i = 0; i < DAYS.size(); i++) {
            LocalDate date = weekStart.plusDays(i);
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("name", DAYS.get(i));
            day.put("date", date.toString());
            day.put("dateLabel", date.format(US_DATE));
            days.add(day);
        }
        return days;
    }

    private String resolveClassName(StudentAdmission student) {
        if (student != null && student.getSchoolClass() != null
                && student.getSchoolClass().getName() != null
                && !student.getSchoolClass().getName().isBlank()) {
            return student.getSchoolClass().getName().trim();
        }
        return "Class 1";
    }

    private String resolveSection(StudentAdmission student) {
        if (student != null && student.getSection() != null && !student.getSection().isBlank()) {
            return student.getSection().trim().toUpperCase(Locale.ROOT);
        }
        return "A";
    }

    private LocalDate normalizeWeekStart(LocalDate weekStart) {
        LocalDate date = weekStart == null ? LocalDate.now() : weekStart;
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
