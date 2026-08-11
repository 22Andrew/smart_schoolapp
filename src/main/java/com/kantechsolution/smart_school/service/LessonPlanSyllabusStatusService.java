package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(11)
public class LessonPlanSyllabusStatusService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final LessonPlanLessonRepository lessonRepository;
    private final LessonPlanTopicRepository topicRepository;
    private final LessonPlanSyllabusStatusRepository statusRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (statusRepository.count() == 0) {
            seedSampleSyllabusStatus();
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchSyllabusStatus(Long classId, String section, Long subjectGroupId, Long subjectId) {
        validateSearchParams(classId, section, subjectGroupId, subjectId);

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject was not found"));

        List<LessonPlanLesson> lessons = lessonRepository
                .findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                        classId, section.trim(), subjectGroupId, subjectId);

        List<Map<String, Object>> rows = new ArrayList<>();
        int serial = 1;
        for (LessonPlanLesson lesson : lessons) {
            if (lesson.getTopics() == null) {
                continue;
            }
            for (LessonPlanTopic topic : lesson.getTopics()) {
                LessonPlanSyllabusStatus status = statusRepository.findByTopicId(topic.getId())
                        .orElseGet(() -> LessonPlanSyllabusStatus.builder()
                                .topicId(topic.getId())
                                .completed(false)
                                .build());
                rows.add(toRow(serial++, lesson, topic, status));
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subjectLabel", formatSubjectLabel(subject));
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> updateStatus(Long topicId, Map<String, Object> payload) {
        LessonPlanTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found"));

        boolean completed = parseBoolean(payload.get("completed"));
        LessonPlanSyllabusStatus status = statusRepository.findByTopicId(topicId)
                .orElse(LessonPlanSyllabusStatus.builder().topicId(topicId).build());

        status.setCompleted(completed);
        if (completed) {
            LocalDate date = parseDate(payload.get("completionDate"));
            status.setCompletionDate(date != null ? date : LocalDate.now());
        } else {
            status.setCompletionDate(null);
        }

        LessonPlanSyllabusStatus saved = statusRepository.save(status);
        LessonPlanLesson lesson = topic.getLesson();
        return toRow(0, lesson, topic, saved);
    }

    private Map<String, Object> toRow(int serial, LessonPlanLesson lesson, LessonPlanTopic topic,
                                      LessonPlanSyllabusStatus status) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("serial", serial);
        row.put("topicId", topic.getId());
        row.put("lessonName", lesson.getLessonName());
        row.put("topicName", topic.getTopicName());
        row.put("lessonTopicLabel", lesson.getLessonName() + " (" + topic.getTopicName() + ")");
        row.put("completionDate", status.getCompletionDate() == null
                ? ""
                : status.getCompletionDate().format(US_DATE));
        row.put("status", Boolean.TRUE.equals(status.getCompleted()) ? "Completed" : "Incomplete");
        row.put("completed", Boolean.TRUE.equals(status.getCompleted()));
        return row;
    }

    private String formatSubjectLabel(Subject subject) {
        if (subject.getSubjectCode() != null && !subject.getSubjectCode().isBlank()) {
            return subject.getName() + " (" + subject.getSubjectCode() + ")";
        }
        return subject.getName();
    }

    private void validateSearchParams(Long classId, String section, Long subjectGroupId, Long subjectId) {
        if (classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null) {
            throw new IllegalArgumentException("Class, Section, Subject Group, and Subject are required");
        }
    }

    private boolean parseBoolean(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        return "true".equalsIgnoreCase(String.valueOf(value))
                || "yes".equalsIgnoreCase(String.valueOf(value))
                || "1".equals(String.valueOf(value));
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

    private void seedSampleSyllabusStatus() {
        Optional<SchoolClass> classOpt = schoolClassRepository.findByNameIgnoreCase("Class 1");
        Optional<Subject> englishOpt = subjectRepository.findByNameIgnoreCase("English");
        if (classOpt.isEmpty() || englishOpt.isEmpty()) {
            return;
        }

        SchoolClass schoolClass = classOpt.get();
        Subject english = englishOpt.get();
        SubjectGroup group = subjectGroupRepository.findAllByOrderByIdDesc().stream()
                .filter(item -> item.getSchoolClass() != null
                        && item.getSchoolClass().getId().equals(schoolClass.getId())
                        && item.getName().equalsIgnoreCase("Class 1 subject"))
                .findFirst()
                .orElse(null);
        if (group == null) {
            return;
        }

        List<SyllabusSeed> seeds = List.of(
                new SyllabusSeed("Chapter 1", "1.1 Noun", LocalDate.of(2026, 4, 1)),
                new SyllabusSeed("First Day at School", "2.1 School Life", LocalDate.of(2026, 4, 3)),
                new SyllabusSeed("The Wind and the Sun", "3.1 The Wind", LocalDate.of(2026, 4, 14)),
                new SyllabusSeed("Storm in the Garden", "4.1 My Garden", LocalDate.of(2026, 4, 17)),
                new SyllabusSeed("The Grasshopper and the Ant", "5.1 The Ant", LocalDate.of(2026, 4, 30)),
                new SyllabusSeed("First Day at School", "6.1 School Life", LocalDate.of(2026, 4, 24))
        );

        for (SyllabusSeed seed : seeds) {
            LessonPlanLesson lesson = lessonRepository
                    .findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                            schoolClass.getId(), "A", group.getId(), english.getId())
                    .stream()
                    .filter(item -> item.getLessonName().equalsIgnoreCase(seed.lessonName()))
                    .findFirst()
                    .orElseGet(() -> createLesson(schoolClass, group, english, seed.lessonName()));

            LessonPlanTopic topic = lesson.getTopics().stream()
                    .filter(item -> item.getTopicName().equalsIgnoreCase(seed.topicName()))
                    .findFirst()
                    .orElseGet(() -> topicRepository.save(LessonPlanTopic.builder()
                            .lesson(lesson)
                            .topicName(seed.topicName())
                            .build()));

            if (topic.getId() == null) {
                topic = topicRepository.save(topic);
            }

            if (statusRepository.findByTopicId(topic.getId()).isEmpty()) {
                statusRepository.save(LessonPlanSyllabusStatus.builder()
                        .topicId(topic.getId())
                        .completed(true)
                        .completionDate(seed.completionDate())
                        .build());
            }
        }
    }

    private LessonPlanLesson createLesson(SchoolClass schoolClass, SubjectGroup group, Subject subject,
                                          String lessonName) {
        LessonPlanLesson lesson = LessonPlanLesson.builder()
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .section("A")
                .subjectGroupId(group.getId())
                .subjectGroupName(group.getName())
                .subjectId(subject.getId())
                .subjectName(subject.getName())
                .subjectCode(subject.getSubjectCode())
                .lessonName(lessonName)
                .topics(new ArrayList<>())
                .build();
        return lessonRepository.save(lesson);
    }

    private record SyllabusSeed(String lessonName, String topicName, LocalDate completionDate) {
    }
}
