package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.LessonPlanSchedule;
import com.kantechsolution.smart_school.repository.LessonPlanScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(12)
public class LessonPlanScheduleService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final LessonPlanScheduleRepository scheduleRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (scheduleRepository.count() == 0) {
            seedSampleSchedules();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWeeklySchedule(String teacherCode, LocalDate weekStart) {
        if (teacherCode == null || teacherCode.isBlank()) {
            throw new IllegalArgumentException("Teacher is required");
        }
        LocalDate start = normalizeWeekStart(weekStart);
        LocalDate end = start.plusDays(6);

        return scheduleRepository
                .findByTeacherCodeIgnoreCaseAndPlanDateBetweenOrderByPlanDateAscTimeFromAsc(
                        teacherCode.trim(), start, end)
                .stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getScheduleById(Long id) {
        LessonPlanSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson plan not found"));
        return toMap(schedule);
    }

    @Transactional
    public Map<String, Object> createSchedule(Map<String, Object> payload) {
        LessonPlanSchedule schedule = new LessonPlanSchedule();
        applyFields(schedule, payload);
        return toMap(scheduleRepository.save(schedule));
    }

    @Transactional
    public Map<String, Object> updateSchedule(Long id, Map<String, Object> payload) {
        LessonPlanSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson plan not found"));
        applyFields(schedule, payload);
        return toMap(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new IllegalArgumentException("Lesson plan not found");
        }
        scheduleRepository.deleteById(id);
    }

    private void applyFields(LessonPlanSchedule schedule, Map<String, Object> payload) {
        String teacherCode = asString(payload.get("teacherCode"));
        String teacherName = asString(payload.get("teacherName"));
        LocalDate planDate = parseDate(payload.get("planDate"));
        String subjectName = asString(payload.get("subjectName"));
        String className = asString(payload.get("className"));
        String section = asString(payload.get("section"));
        LocalTime timeFrom = parseTime(payload.get("timeFrom"));
        LocalTime timeTo = parseTime(payload.get("timeTo"));

        if (teacherCode == null || teacherCode.isBlank()
                || teacherName == null || teacherName.isBlank()
                || planDate == null
                || subjectName == null || subjectName.isBlank()
                || className == null || className.isBlank()
                || section == null || section.isBlank()
                || timeFrom == null || timeTo == null) {
            throw new IllegalArgumentException("Teacher, date, subject, class, section, and time are required");
        }

        schedule.setTeacherCode(teacherCode.trim());
        schedule.setTeacherName(teacherName.trim());
        schedule.setPlanDate(planDate);
        schedule.setDayOfWeek(planDate.getDayOfWeek().name().substring(0, 1)
                + planDate.getDayOfWeek().name().substring(1).toLowerCase(Locale.ROOT));
        schedule.setSubjectId(asLong(payload.get("subjectId")));
        schedule.setSubjectName(subjectName.trim());
        schedule.setSubjectCode(asString(payload.get("subjectCode")));
        schedule.setClassId(asLong(payload.get("classId")));
        schedule.setClassName(className.trim());
        schedule.setSection(section.trim().toUpperCase(Locale.ROOT));
        schedule.setTimeFrom(timeFrom);
        schedule.setTimeTo(timeTo);
        schedule.setRoomNo(asString(payload.get("roomNo")));
    }

    private Map<String, Object> toMap(LessonPlanSchedule schedule) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", schedule.getId());
        row.put("teacherCode", schedule.getTeacherCode());
        row.put("teacherName", schedule.getTeacherName());
        row.put("planDate", schedule.getPlanDate().toString());
        row.put("planDateLabel", schedule.getPlanDate().format(US_DATE));
        row.put("dayOfWeek", schedule.getDayOfWeek());
        row.put("subjectId", schedule.getSubjectId());
        row.put("subjectName", schedule.getSubjectName());
        row.put("subjectCode", schedule.getSubjectCode());
        row.put("subjectLabel", formatSubjectLabel(schedule));
        row.put("classId", schedule.getClassId());
        row.put("className", schedule.getClassName());
        row.put("section", schedule.getSection());
        row.put("classLabel", schedule.getClassName() + "(" + schedule.getSection() + ")");
        row.put("timeFrom", formatTime(schedule.getTimeFrom()));
        row.put("timeTo", formatTime(schedule.getTimeTo()));
        row.put("roomNo", schedule.getRoomNo() == null ? "" : schedule.getRoomNo());
        return row;
    }

    private String formatSubjectLabel(LessonPlanSchedule schedule) {
        if (schedule.getSubjectCode() != null && !schedule.getSubjectCode().isBlank()) {
            return schedule.getSubjectName() + " (" + schedule.getSubjectCode() + ")";
        }
        return schedule.getSubjectName();
    }

    private String formatTime(LocalTime time) {
        return time == null ? "" : time.toString().substring(0, 5);
    }

    private LocalDate normalizeWeekStart(LocalDate weekStart) {
        LocalDate date = weekStart == null ? LocalDate.now() : weekStart;
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private LocalDate parseDate(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return null;
        }
        if (text.contains("/")) {
            return LocalDate.parse(text, US_DATE);
        }
        return LocalDate.parse(text);
    }

    private LocalTime parseTime(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return null;
        }
        if (text.length() == 5) {
            return LocalTime.parse(text + ":00");
        }
        return LocalTime.parse(text.length() >= 8 ? text : text + ":00");
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.valueOf(String.valueOf(value));
    }

    private void seedSampleSchedules() {
        LocalDate weekStart = LocalDate.of(2026, 8, 10);
        String teacherCode = "9002";
        String teacherName = "Shivam Verma";

        List<ScheduleSeed> seeds = List.of(
                seed(weekStart, "English", "210", "Class 1", "A", "08:00", "08:45", "100"),
                seed(weekStart.plusDays(1), "English", "210", "Class 1", "A", "08:00", "08:45", "100"),
                seed(weekStart.plusDays(2), "English", "210", "Class 1", "A", "08:00", "08:45", "100"),
                seed(weekStart.plusDays(3), "English", "210", "Class 1", "A", "08:00", "08:45", "100"),
                seed(weekStart.plusDays(4), "English", "210", "Class 1", "A", "08:00", "08:45", "100"),
                seed(weekStart.plusDays(5), "Science", "111", "Class 1", "A", "08:00", "08:45", "100")
        );

        for (ScheduleSeed item : seeds) {
            LessonPlanSchedule schedule = LessonPlanSchedule.builder()
                    .teacherCode(teacherCode)
                    .teacherName(teacherName)
                    .planDate(item.date())
                    .dayOfWeek(item.date().getDayOfWeek().name().substring(0, 1)
                            + item.date().getDayOfWeek().name().substring(1).toLowerCase(Locale.ROOT))
                    .subjectName(item.subjectName())
                    .subjectCode(item.subjectCode())
                    .className(item.className())
                    .section(item.section())
                    .timeFrom(LocalTime.parse(item.timeFrom() + ":00"))
                    .timeTo(LocalTime.parse(item.timeTo() + ":00"))
                    .roomNo(item.roomNo())
                    .build();
            scheduleRepository.save(schedule);
        }
    }

    private ScheduleSeed seed(LocalDate date, String subjectName, String subjectCode,
                              String className, String section, String timeFrom,
                              String timeTo, String roomNo) {
        return new ScheduleSeed(date, subjectName, subjectCode, className, section, timeFrom, timeTo, roomNo);
    }

    private record ScheduleSeed(
            LocalDate date,
            String subjectName,
            String subjectCode,
            String className,
            String section,
            String timeFrom,
            String timeTo,
            String roomNo
    ) {
    }
}
