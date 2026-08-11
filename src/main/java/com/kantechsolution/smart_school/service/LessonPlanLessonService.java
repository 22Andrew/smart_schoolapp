package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.LessonPlanLessonRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SubjectGroupRepository;
import com.kantechsolution.smart_school.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LessonPlanLessonService {

    private final LessonPlanLessonRepository lessonRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllLessonGroupRows() {
        List<LessonPlanLesson> lessons = lessonRepository
                .findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc();

        Map<String, List<LessonPlanLesson>> grouped = new LinkedHashMap<>();
        for (LessonPlanLesson lesson : lessons) {
            grouped.computeIfAbsent(groupKey(lesson), key -> new ArrayList<>()).add(lesson);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (List<LessonPlanLesson> groupLessons : grouped.values()) {
            rows.add(toGroupRow(groupLessons));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLessonGroup(Long classId, String section, Long subjectGroupId, Long subjectId) {
        validateContextParams(classId, section, subjectGroupId, subjectId);
        List<LessonPlanLesson> lessons = findLessonsForContext(classId, section, subjectGroupId, subjectId);
        if (lessons.isEmpty()) {
            throw new IllegalArgumentException("Lesson group not found");
        }
        return toGroupDetail(lessons);
    }

    @Transactional
    public Map<String, Object> saveLessons(Map<String, Object> payload) {
        Context context = resolveContext(payload);
        List<String> lessonNames = normalizeNames(payload.get("lessonNames"));
        if (lessonNames.isEmpty()) {
            throw new IllegalArgumentException("At least one lesson name is required");
        }

        List<LessonPlanLesson> existing = findLessonsForContext(
                context.classId(), context.section(), context.subjectGroupId(), context.subjectId());
        Set<String> existingNames = new HashSet<>();
        existing.forEach(lesson -> existingNames.add(lesson.getLessonName().toLowerCase(Locale.ROOT)));

        for (String name : lessonNames) {
            if (existingNames.contains(name.toLowerCase(Locale.ROOT))) {
                continue;
            }
            LessonPlanLesson lesson = buildLesson(context, name);
            existing.add(lessonRepository.save(lesson));
            existingNames.add(name.toLowerCase(Locale.ROOT));
        }

        if (existing.isEmpty()) {
            throw new IllegalArgumentException("At least one new lesson name is required");
        }

        return toGroupRow(existing);
    }

    @Transactional
    public Map<String, Object> updateLessonGroup(Map<String, Object> payload) {
        Long originalClassId = asLong(payload.get("originalClassId"));
        String originalSection = asString(payload.get("originalSection"));
        Long originalSubjectGroupId = asLong(payload.get("originalSubjectGroupId"));
        Long originalSubjectId = asLong(payload.get("originalSubjectId"));

        if (originalClassId == null || originalSection == null || originalSection.isBlank()
                || originalSubjectGroupId == null || originalSubjectId == null) {
            originalClassId = asLong(payload.get("classId"));
            originalSection = asString(payload.get("section"));
            originalSubjectGroupId = asLong(payload.get("subjectGroupId"));
            originalSubjectId = asLong(payload.get("subjectId"));
        }

        validateContextParams(originalClassId, originalSection, originalSubjectGroupId, originalSubjectId);

        Context context = resolveContext(payload);
        List<String> lessonNames = normalizeNames(payload.get("lessonNames"));
        if (lessonNames.isEmpty()) {
            throw new IllegalArgumentException("At least one lesson name is required");
        }

        List<LessonPlanLesson> existing = findLessonsForContext(
                originalClassId, originalSection, originalSubjectGroupId, originalSubjectId);

        Map<String, LessonPlanLesson> existingByName = new LinkedHashMap<>();
        for (LessonPlanLesson lesson : existing) {
            existingByName.put(lesson.getLessonName().toLowerCase(Locale.ROOT), lesson);
        }

        Set<String> desiredNames = new LinkedHashSet<>();
        for (String name : lessonNames) {
            desiredNames.add(name.toLowerCase(Locale.ROOT));
        }

        for (LessonPlanLesson lesson : existing) {
            if (!desiredNames.contains(lesson.getLessonName().toLowerCase(Locale.ROOT))) {
                lessonRepository.delete(lesson);
            }
        }

        List<LessonPlanLesson> updatedLessons = new ArrayList<>();
        for (String name : lessonNames) {
            String key = name.toLowerCase(Locale.ROOT);
            LessonPlanLesson lesson = existingByName.get(key);
            if (lesson != null) {
                applyContext(lesson, context);
                updatedLessons.add(lessonRepository.save(lesson));
            } else {
                updatedLessons.add(lessonRepository.save(buildLesson(context, name)));
            }
        }

        return toGroupRow(updatedLessons);
    }

    @Transactional
    public void deleteLessonGroup(Long classId, String section, Long subjectGroupId, Long subjectId) {
        validateContextParams(classId, section, subjectGroupId, subjectId);
        List<LessonPlanLesson> lessons = findLessonsForContext(classId, section, subjectGroupId, subjectId);
        if (lessons.isEmpty()) {
            throw new IllegalArgumentException("Lesson group not found");
        }
        lessonRepository.deleteAll(lessons);
    }

    private List<LessonPlanLesson> findLessonsForContext(Long classId, String section,
                                                         Long subjectGroupId, Long subjectId) {
        return lessonRepository.findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                classId, section.trim(), subjectGroupId, subjectId);
    }

    private Context resolveContext(Map<String, Object> payload) {
        Long classId = asLong(payload.get("classId"));
        String section = asString(payload.get("section"));
        Long subjectGroupId = asLong(payload.get("subjectGroupId"));
        Long subjectId = asLong(payload.get("subjectId"));
        validateContextParams(classId, section, subjectGroupId, subjectId);

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));
        SubjectGroup subjectGroup = subjectGroupRepository.findById(subjectGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject group was not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject was not found"));

        return new Context(
                classId,
                schoolClass.getName(),
                section.trim().toUpperCase(Locale.ROOT),
                subjectGroupId,
                subjectGroup.getName(),
                subjectId,
                subject.getName(),
                subject.getSubjectCode()
        );
    }

    private LessonPlanLesson buildLesson(Context context, String lessonName) {
        LessonPlanLesson lesson = new LessonPlanLesson();
        applyContext(lesson, context);
        lesson.setLessonName(lessonName.trim());
        lesson.setTopics(new ArrayList<>());
        return lesson;
    }

    private void applyContext(LessonPlanLesson lesson, Context context) {
        lesson.setClassId(context.classId());
        lesson.setClassName(context.className());
        lesson.setSection(context.section());
        lesson.setSubjectGroupId(context.subjectGroupId());
        lesson.setSubjectGroupName(context.subjectGroupName());
        lesson.setSubjectId(context.subjectId());
        lesson.setSubjectName(context.subjectName());
        lesson.setSubjectCode(context.subjectCode());
    }

    private Map<String, Object> toGroupRow(List<LessonPlanLesson> lessons) {
        if (lessons == null || lessons.isEmpty()) {
            return Map.of();
        }

        lessons.sort(Comparator.comparing(LessonPlanLesson::getLessonName, String.CASE_INSENSITIVE_ORDER));
        LessonPlanLesson first = lessons.get(0);
        List<String> lessonNames = lessons.stream().map(LessonPlanLesson::getLessonName).toList();
        List<Long> lessonIds = lessons.stream().map(LessonPlanLesson::getId).toList();

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("groupKey", groupKey(first));
        row.put("classId", first.getClassId());
        row.put("className", first.getClassName());
        row.put("section", first.getSection());
        row.put("subjectGroupId", first.getSubjectGroupId());
        row.put("subjectGroupName", first.getSubjectGroupName());
        row.put("subjectId", first.getSubjectId());
        row.put("subjectLabel", formatSubjectLabel(first));
        row.put("subjectName", first.getSubjectName());
        row.put("subjectCode", first.getSubjectCode());
        row.put("lessonNames", lessonNames);
        row.put("lessonText", String.join("\n", lessonNames));
        row.put("lessonIds", lessonIds);
        return row;
    }

    private Map<String, Object> toGroupDetail(List<LessonPlanLesson> lessons) {
        Map<String, Object> detail = toGroupRow(lessons);
        detail.put("originalClassId", detail.get("classId"));
        detail.put("originalSection", detail.get("section"));
        detail.put("originalSubjectGroupId", detail.get("subjectGroupId"));
        detail.put("originalSubjectId", detail.get("subjectId"));
        return detail;
    }

    private String groupKey(LessonPlanLesson lesson) {
        return lesson.getClassId() + "|"
                + lesson.getSection().toUpperCase(Locale.ROOT) + "|"
                + lesson.getSubjectGroupId() + "|"
                + lesson.getSubjectId();
    }

    private String formatSubjectLabel(LessonPlanLesson lesson) {
        if (lesson.getSubjectCode() != null && !lesson.getSubjectCode().isBlank()) {
            return lesson.getSubjectName() + " (" + lesson.getSubjectCode() + ")";
        }
        return lesson.getSubjectName();
    }

    private void validateContextParams(Long classId, String section, Long subjectGroupId, Long subjectId) {
        if (classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null) {
            throw new IllegalArgumentException("Class, Section, Subject Group, and Subject are required");
        }
    }

    private List<String> normalizeNames(Object value) {
        if (!(value instanceof List<?> raw)) {
            return List.of();
        }
        LinkedHashSet<String> unique = new LinkedHashSet<>();
        for (Object item : raw) {
            if (item == null) {
                continue;
            }
            String text = String.valueOf(item).trim();
            if (!text.isEmpty()) {
                unique.add(text);
            }
        }
        return new ArrayList<>(unique);
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

    private record Context(
            Long classId,
            String className,
            String section,
            Long subjectGroupId,
            String subjectGroupName,
            Long subjectId,
            String subjectName,
            String subjectCode
    ) {
    }
}
