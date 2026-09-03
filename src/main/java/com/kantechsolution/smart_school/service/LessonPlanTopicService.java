package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.LessonPlanLessonRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SubjectGroupRepository;
import com.kantechsolution.smart_school.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Order(10)
public class LessonPlanTopicService implements ApplicationRunner {

    private final LessonPlanLessonRepository lessonRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (lessonRepository.count() == 0) {
            seedSampleTopics();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllTopicRows() {
        return lessonRepository.findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc().stream()
                .map(this::toRow)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLessons(Long classId, String section, Long subjectGroupId, Long subjectId) {
        if (classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null) {
            return List.of();
        }
        return lessonRepository
                .findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                        classId, section.trim(), subjectGroupId, subjectId)
                .stream()
                .map(lesson -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", lesson.getId());
                    row.put("lessonName", lesson.getLessonName());
                    return row;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLessonById(Long id) {
        LessonPlanLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        return toDetail(lesson);
    }

    @Transactional
    public Map<String, Object> saveTopics(Map<String, Object> payload) {
        Long lessonId = asLong(payload.get("lessonId"));
        List<String> topicNames = normalizeTopicNames(payload.get("topicNames"));

        if (topicNames.isEmpty()) {
            throw new IllegalArgumentException("At least one topic name is required");
        }

        LessonPlanLesson lesson;
        if (lessonId != null) {
            lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
            appendTopics(lesson, topicNames);
        } else {
            lesson = createLessonFromPayload(payload);
            applyTopics(lesson, topicNames);
        }

        return toRow(lessonRepository.save(lesson));
    }

    @Transactional
    public Map<String, Object> updateLessonTopics(Long id, Map<String, Object> payload) {
        LessonPlanLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        applyLessonContext(lesson, payload);
        List<String> topicNames = normalizeTopicNames(payload.get("topicNames"));
        if (topicNames.isEmpty()) {
            throw new IllegalArgumentException("At least one topic name is required");
        }
        applyTopics(lesson, topicNames);

        return toRow(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new IllegalArgumentException("Lesson not found");
        }
        lessonRepository.deleteById(id);
    }

    private LessonPlanLesson createLessonFromPayload(Map<String, Object> payload) {
        LessonPlanLesson lesson = new LessonPlanLesson();
        applyLessonContext(lesson, payload);

        String lessonName = asString(payload.get("lessonName"));
        if (lessonName == null || lessonName.isBlank()) {
            throw new IllegalArgumentException("Lesson is required");
        }
        lesson.setLessonName(lessonName.trim());
        return lesson;
    }

    private void applyLessonContext(LessonPlanLesson lesson, Map<String, Object> payload) {
        Long classId = asLong(payload.get("classId"));
        String section = asString(payload.get("section"));
        Long subjectGroupId = asLong(payload.get("subjectGroupId"));
        Long subjectId = asLong(payload.get("subjectId"));

        if (classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null) {
            throw new IllegalArgumentException("Class, Section, Subject Group, and Subject are required");
        }

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));
        SubjectGroup subjectGroup = subjectGroupRepository.findById(subjectGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject group was not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject was not found"));

        lesson.setClassId(classId);
        lesson.setClassName(schoolClass.getName());
        lesson.setSection(section.trim().toUpperCase(Locale.ROOT));
        lesson.setSubjectGroupId(subjectGroupId);
        lesson.setSubjectGroupName(subjectGroup.getName());
        lesson.setSubjectId(subjectId);
        lesson.setSubjectName(subject.getName());
        lesson.setSubjectCode(subject.getSubjectCode());

        String lessonName = asString(payload.get("lessonName"));
        if (lessonName != null && !lessonName.isBlank()) {
            lesson.setLessonName(lessonName.trim());
        }
    }

    private void appendTopics(LessonPlanLesson lesson, List<String> topicNames) {
        Set<String> existing = new HashSet<>();
        lesson.getTopics().forEach(topic -> existing.add(topic.getTopicName().toLowerCase(Locale.ROOT)));

        for (String name : topicNames) {
            if (!existing.contains(name.toLowerCase(Locale.ROOT))) {
                LessonPlanTopic topic = LessonPlanTopic.builder()
                        .lesson(lesson)
                        .topicName(name)
                        .build();
                lesson.getTopics().add(topic);
                existing.add(name.toLowerCase(Locale.ROOT));
            }
        }
    }

    private void applyTopics(LessonPlanLesson lesson, List<String> topicNames) {
        lesson.getTopics().clear();
        for (String name : topicNames) {
            LessonPlanTopic topic = LessonPlanTopic.builder()
                    .lesson(lesson)
                    .topicName(name)
                    .build();
            lesson.getTopics().add(topic);
        }
    }

    private List<String> normalizeTopicNames(Object value) {
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

    private Map<String, Object> toRow(LessonPlanLesson lesson) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", lesson.getId());
        row.put("classId", lesson.getClassId());
        row.put("className", lesson.getClassName());
        row.put("section", lesson.getSection());
        row.put("subjectGroupId", lesson.getSubjectGroupId());
        row.put("subjectGroupName", lesson.getSubjectGroupName());
        row.put("subjectId", lesson.getSubjectId());
        row.put("subjectLabel", formatSubjectLabel(lesson));
        row.put("subjectName", lesson.getSubjectName());
        row.put("subjectCode", lesson.getSubjectCode());
        row.put("lessonName", lesson.getLessonName());
        row.put("topics", lesson.getTopics().stream().map(LessonPlanTopic::getTopicName).toList());
        row.put("topicText", lesson.getTopics().stream()
                .map(LessonPlanTopic::getTopicName)
                .reduce((a, b) -> a + "\n" + b)
                .orElse(""));
        return row;
    }

    private Map<String, Object> toDetail(LessonPlanLesson lesson) {
        Map<String, Object> detail = toRow(lesson);
        detail.put("topicNames", lesson.getTopics().stream().map(LessonPlanTopic::getTopicName).toList());
        return detail;
    }

    private String formatSubjectLabel(LessonPlanLesson lesson) {
        if (lesson.getSubjectCode() != null && !lesson.getSubjectCode().isBlank()) {
            return lesson.getSubjectName() + " (" + lesson.getSubjectCode() + ")";
        }
        return lesson.getSubjectName();
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

    private void seedSampleTopics() {
        SchoolClass class1 = ensureClass("Class 1", "A");
        SchoolClass class2 = ensureClass("Class 2", "A");
        SchoolClass class3 = ensureClass("Class 3", "A");

        Subject english = ensureSubject("English", "210");
        Subject hindi = ensureSubject("Hindi", "230");
        Subject mathematics = ensureSubject("Mathematics", "110");

        SubjectGroup group1 = ensureSubjectGroup("Class 1 subject", class1, List.of("A"), Set.of(english));
        SubjectGroup group2 = ensureSubjectGroup("Class 2 Subject", class2, List.of("A"), Set.of(hindi));
        SubjectGroup group3 = ensureSubjectGroup("Class 3 Subject", class3, List.of("A"), Set.of(mathematics));

        List<LessonPlanLesson> samples = List.of(
                buildLinkedLesson(class1, "A", group1, english, "Chapter 1",
                        List.of("Alphabet", "Vowels", "Consonants")),
                buildLinkedLesson(class2, "A", group2, hindi, "Size and Shape",
                        List.of("Big and Small", "Circle", "Square")),
                buildLinkedLesson(class3, "A", group3, mathematics, "First Day at School",
                        List.of("Numbers 1-10", "Counting Objects"))
        );
        lessonRepository.saveAll(samples);
    }

    private SchoolClass ensureClass(String name, String section) {
        SchoolClass schoolClass = schoolClassRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> schoolClassRepository.save(new SchoolClass(name, List.of(section))));
        if (schoolClass.getSections() == null || !schoolClass.getSections().stream()
                .anyMatch(value -> value.equalsIgnoreCase(section))) {
            List<String> sections = new ArrayList<>(schoolClass.getSections() == null
                    ? List.of() : schoolClass.getSections());
            sections.add(section.toUpperCase(Locale.ROOT));
            schoolClass.setSections(sections);
            schoolClass = schoolClassRepository.save(schoolClass);
        }
        return schoolClass;
    }

    private Subject ensureSubject(String name, String code) {
        return subjectRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> subjectRepository.save(Subject.builder()
                        .name(name)
                        .subjectCode(code)
                        .build()));
    }

    private SubjectGroup ensureSubjectGroup(String name, SchoolClass schoolClass, List<String> sections,
                                            Set<Subject> subjects) {
        List<SubjectGroup> existingGroups = subjectGroupRepository.findAllByOrderByIdDesc();
        Optional<SubjectGroup> matched = existingGroups.stream()
                .filter(group -> group.getName().equalsIgnoreCase(name)
                        && group.getSchoolClass() != null
                        && group.getSchoolClass().getId().equals(schoolClass.getId()))
                .findFirst();
        if (matched.isPresent()) {
            return matched.get();
        }

        SubjectGroup group = new SubjectGroup();
        group.setName(name);
        group.setSchoolClass(schoolClass);
        group.setSections(new ArrayList<>(sections));
        group.setSubjects(new LinkedHashSet<>(subjects));
        return subjectGroupRepository.save(group);
    }

    private LessonPlanLesson buildLinkedLesson(SchoolClass schoolClass, String section, SubjectGroup group,
                                               Subject subject, String lessonName, List<String> topics) {
        LessonPlanLesson lesson = LessonPlanLesson.builder()
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .section(section.toUpperCase(Locale.ROOT))
                .subjectGroupId(group.getId())
                .subjectGroupName(group.getName())
                .subjectId(subject.getId())
                .subjectName(subject.getName())
                .subjectCode(subject.getSubjectCode())
                .lessonName(lessonName)
                .build();

        List<LessonPlanTopic> topicEntities = new ArrayList<>();
        for (String topicName : topics) {
            topicEntities.add(LessonPlanTopic.builder()
                    .lesson(lesson)
                    .topicName(topicName)
                    .build());
        }
        lesson.setTopics(topicEntities);
        return lesson;
    }
}
