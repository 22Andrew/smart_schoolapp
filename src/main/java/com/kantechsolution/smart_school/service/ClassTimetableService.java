package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ClassTimetable;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.model.Subject;
import com.kantechsolution.smart_school.model.SubjectGroup;
import com.kantechsolution.smart_school.repository.ClassTimetableRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SubjectGroupRepository;
import com.kantechsolution.smart_school.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Service for class timetable persistence and response mapping.
 */
@Service
public class ClassTimetableService {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    @Autowired
    private ClassTimetableRepository classTimetableRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SubjectGroupRepository subjectGroupRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public List<Map<String, Object>> getTimetable(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        String normalizedSection = normalizeSection(section);
        List<ClassTimetable> rows = classTimetableRepository
                .findBySchoolClassIdAndSectionIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(classId, normalizedSection);

        List<Map<String, Object>> result = new ArrayList<>();
        for (ClassTimetable row : rows) {
            result.add(toMap(row));
        }
        return result;
    }

    public List<Map<String, Object>> getTimetableByTeacher(String teacherCode) {
        if (teacherCode == null || teacherCode.isBlank()) {
            throw new IllegalArgumentException("Teacher is required");
        }
        List<ClassTimetable> rows = classTimetableRepository
                .findByTeacherCodeOrderByDayOfWeekAscStartTimeAsc(teacherCode.trim());

        List<Map<String, Object>> result = new ArrayList<>();
        for (ClassTimetable row : rows) {
            result.add(toMap(row));
        }
        return result;
    }

    @Transactional
    public List<Map<String, Object>> saveTimetable(Long classId, String section, Long subjectGroupId,
                                                   List<Map<String, Object>> periods) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        String normalizedSection = normalizeSection(section);

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));

        boolean sectionAllowed = schoolClass.getSections() != null && schoolClass.getSections().stream()
                .anyMatch(s -> s != null && s.equalsIgnoreCase(normalizedSection));
        if (!sectionAllowed) {
            throw new IllegalArgumentException("Section " + normalizedSection + " is not available for the selected class");
        }

        SubjectGroup subjectGroup = null;
        if (subjectGroupId != null) {
            subjectGroup = subjectGroupRepository.findById(subjectGroupId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject group not found"));
        }

        if (periods == null || periods.isEmpty()) {
            throw new IllegalArgumentException("At least one period is required");
        }

        classTimetableRepository.deleteBySchoolClassIdAndSectionIgnoreCase(classId, normalizedSection);

        List<ClassTimetable> toSave = new ArrayList<>();
        Map<String, Integer> dayCounters = new HashMap<>();

        for (Map<String, Object> period : periods) {
            ClassTimetable entry = buildEntry(period, schoolClass, normalizedSection, subjectGroup, dayCounters);
            toSave.add(entry);
        }

        List<ClassTimetable> saved = classTimetableRepository.saveAll(toSave);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ClassTimetable row : saved) {
            result.add(toMap(row));
        }
        return result;
    }

    private ClassTimetable buildEntry(Map<String, Object> period, SchoolClass schoolClass, String section,
                                      SubjectGroup subjectGroup, Map<String, Integer> dayCounters) {
        Long subjectId = asLong(period.get("subjectId"));
        if (subjectId == null) {
            throw new IllegalArgumentException("Subject is required for each period");
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));

        String day = asString(period.get("dayOfWeek"));
        if (day == null || day.isBlank()) {
            throw new IllegalArgumentException("Day of week is required");
        }
        day = capitalizeDay(day.trim());

        LocalTime start = parseTime(asString(period.get("timeFrom")), "Time From");
        LocalTime end = parseTime(asString(period.get("timeTo")), "Time To");
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("Time To must be after Time From");
        }

        String teacherName = asString(period.get("teacherName"));
        String teacherCode = asString(period.get("teacherId"));
        if ((teacherName == null || teacherName.isBlank()) && teacherCode != null) {
            teacherName = teacherCode;
        }

        Integer periodNumber = asInteger(period.get("periodNumber"));
        if (periodNumber == null) {
            int next = dayCounters.getOrDefault(day, 0) + 1;
            dayCounters.put(day, next);
            periodNumber = next;
        } else {
            dayCounters.put(day, Math.max(dayCounters.getOrDefault(day, 0), periodNumber));
        }

        ClassTimetable entry = new ClassTimetable();
        entry.setSchoolClass(schoolClass);
        entry.setSection(section);
        entry.setSubjectGroup(subjectGroup);
        entry.setSubject(subject);
        entry.setDayOfWeek(day);
        entry.setStartTime(start);
        entry.setEndTime(end);
        entry.setTeacherName(teacherName == null ? "" : teacherName.trim());
        entry.setTeacherCode(teacherCode == null ? "" : teacherCode.trim());
        entry.setRoomNumber(asString(period.get("roomNo")) == null ? "" : asString(period.get("roomNo")).trim());
        entry.setPeriodNumber(periodNumber);
        return entry;
    }

    private Map<String, Object> toMap(ClassTimetable row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("classId", row.getSchoolClass() != null ? row.getSchoolClass().getId() : null);
        map.put("className", row.getSchoolClass() != null ? row.getSchoolClass().getName() : null);
        map.put("section", row.getSection());
        map.put("subjectGroupId", row.getSubjectGroup() != null ? row.getSubjectGroup().getId() : null);
        map.put("subjectGroupName", row.getSubjectGroup() != null ? row.getSubjectGroup().getName() : null);
        map.put("subjectId", row.getSubject() != null ? row.getSubject().getId() : null);
        map.put("subjectName", row.getSubject() != null ? row.getSubject().getName() : null);
        map.put("subjectCode", row.getSubject() != null ? row.getSubject().getSubjectCode() : null);
        map.put("dayOfWeek", row.getDayOfWeek());
        map.put("timeFrom", formatTime(row.getStartTime()));
        map.put("timeTo", formatTime(row.getEndTime()));
        map.put("teacherId", row.getTeacherCode());
        map.put("teacherName", row.getTeacherName());
        map.put("roomNo", row.getRoomNumber());
        map.put("periodNumber", row.getPeriodNumber());
        return map;
    }

    private String formatTime(LocalTime time) {
        return time == null ? null : time.format(TIME_FORMAT);
    }

    private LocalTime parseTime(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        String trimmed = value.trim();
        try {
            if (trimmed.length() == 5) {
                return LocalTime.parse(trimmed, TIME_FORMAT);
            }
            return LocalTime.parse(trimmed);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid " + fieldName + ": " + value);
        }
    }

    private String normalizeSection(String section) {
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        return section.trim().toUpperCase(Locale.ROOT);
    }

    private String capitalizeDay(String day) {
        String lower = day.toLowerCase(Locale.ROOT);
        return lower.substring(0, 1).toUpperCase(Locale.ROOT) + lower.substring(1);
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null || "".equals(String.valueOf(value).trim())) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer asInteger(Object value) {
        if (value == null || "".equals(String.valueOf(value).trim())) {
            return null;
        }
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
