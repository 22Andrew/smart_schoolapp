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
    private final LessonPlanScheduleRepository scheduleRepository;
    private final LessonPlanDetailRepository detailRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (statusRepository.count() == 0) {
            seedSampleSyllabusStatus();
        }
    }

    @Transactional
    public Map<String, Object> searchSyllabusStatus(Long classId, String section, Long subjectGroupId, Long subjectId) {
        validateSearchParams(classId, section, subjectGroupId, subjectId);

        String sectionNorm = section.trim();
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Selected class was not found"));
        SubjectGroup group = subjectGroupRepository.findById(subjectGroupId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject group was not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Selected subject was not found"));

        List<LessonPlanLesson> candidates = new ArrayList<>();
        addUniqueLessons(candidates, lessonRepository
                .findByClassIdAndSectionIgnoreCaseOrderBySubjectNameAscIdAsc(classId, sectionNorm));
        addUniqueLessons(candidates, lessonRepository
                .findByClassNameIgnoreCaseAndSectionIgnoreCaseOrderBySubjectNameAscIdAsc(
                        schoolClass.getName(), sectionNorm));

        List<LessonPlanLesson> lessons = candidates.stream()
                .filter(lesson -> matchesSubjectGroup(lesson, group))
                .filter(lesson -> matchesSubject(lesson, subject))
                .toList();
        if (lessons.isEmpty()) {
            lessons = candidates.stream()
                    .filter(lesson -> matchesSubject(lesson, subject))
                    .toList();
        }

        LinkedHashMap<String, Map<String, Object>> uniqueRows = new LinkedHashMap<>();
        for (LessonPlanLesson lesson : lessons) {
            List<LessonPlanTopic> topics = lesson.getTopics() == null ? List.of() : lesson.getTopics();
            for (LessonPlanTopic topic : topics) {
                LessonPlanSyllabusStatus status = statusRepository.findByTopicId(topic.getId())
                        .orElseGet(() -> LessonPlanSyllabusStatus.builder()
                                .topicId(topic.getId())
                                .completed(false)
                                .build());
                uniqueRows.putIfAbsent(rowKey(lesson.getLessonName(), topic.getTopicName()),
                        toRow(0, lesson, topic, status));
            }
        }

        addRowsFromManageLessonPlan(uniqueRows, schoolClass, sectionNorm, group, subject, candidates);

        List<Map<String, Object>> rows = new ArrayList<>();
        int serial = 1;
        for (Map<String, Object> row : uniqueRows.values()) {
            row.put("serial", serial++);
            rows.add(row);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subjectLabel", formatSubjectLabel(subject));
        response.put("className", schoolClass.getName());
        response.put("section", sectionNorm.toUpperCase(Locale.ROOT));
        response.put("subjectGroupName", group.getName());
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

    private void addRowsFromManageLessonPlan(LinkedHashMap<String, Map<String, Object>> uniqueRows,
                                             SchoolClass schoolClass,
                                             String section,
                                             SubjectGroup group,
                                             Subject subject,
                                             List<LessonPlanLesson> knownLessons) {
        List<LessonPlanSchedule> schedules = new ArrayList<>();
        addUniqueSchedules(schedules, scheduleRepository
                .findByClassIdAndSectionIgnoreCaseOrderByPlanDateAscTimeFromAsc(schoolClass.getId(), section));
        addUniqueSchedules(schedules, scheduleRepository
                .findByClassNameIgnoreCaseAndSectionIgnoreCaseOrderByPlanDateAscTimeFromAsc(
                        schoolClass.getName(), section));

        for (LessonPlanSchedule schedule : schedules) {
            if (!matchesScheduleSubject(schedule, subject)) {
                continue;
            }
            LessonPlanDetail detail = detailRepository.findByScheduleId(schedule.getId()).orElse(null);
            String lessonName = text(detail == null ? null : detail.getLessonName());
            String topicName = text(detail == null ? null : detail.getTopicName());
            if (lessonName.isBlank() && topicName.isBlank()) {
                continue;
            }
            if (lessonName.isBlank()) {
                lessonName = text(schedule.getSubjectName());
            }
            if (topicName.isBlank()) {
                topicName = "Lesson Plan";
            }

            String key = rowKey(lessonName, topicName);
            if (uniqueRows.containsKey(key)) {
                continue;
            }

            LessonPlanTopic topic = findOrCreateTopic(schoolClass, section, group, subject, knownLessons,
                    lessonName, topicName);
            if (topic == null || topic.getId() == null) {
                uniqueRows.put(key, toPlainRow(0, lessonName, topicName));
                continue;
            }
            LessonPlanSyllabusStatus status = statusRepository.findByTopicId(topic.getId())
                    .orElseGet(() -> LessonPlanSyllabusStatus.builder()
                            .topicId(topic.getId())
                            .completed(false)
                            .build());
            LessonPlanLesson lesson = topic.getLesson();
            uniqueRows.put(key, toRow(0, lesson, topic, status));
        }
    }

    private LessonPlanTopic findOrCreateTopic(SchoolClass schoolClass, String section, SubjectGroup group,
                                              Subject subject, List<LessonPlanLesson> knownLessons,
                                              String lessonName, String topicName) {
        LessonPlanTopic existing = findTopic(knownLessons, lessonName, topicName);
        if (existing != null) {
            return existing;
        }

        List<LessonPlanLesson> contextLessons = lessonRepository
                .findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                        schoolClass.getId(), section, group.getId(), subject.getId());
        existing = findTopic(contextLessons, lessonName, topicName);
        if (existing != null) {
            return existing;
        }

        LessonPlanLesson lesson = contextLessons.stream()
                .filter(item -> lessonName.equalsIgnoreCase(text(item.getLessonName())))
                .findFirst()
                .orElseGet(() -> createLesson(schoolClass, group, subject, lessonName, section));

        LessonPlanTopic topic = LessonPlanTopic.builder()
                .lesson(lesson)
                .topicName(topicName)
                .build();
        topic = topicRepository.save(topic);
        if (lesson.getTopics() == null) {
            lesson.setTopics(new ArrayList<>());
        }
        lesson.getTopics().add(topic);
        return topic;
    }

    private LessonPlanTopic findTopic(List<LessonPlanLesson> lessons, String lessonName, String topicName) {
        if (lessons == null) {
            return null;
        }
        for (LessonPlanLesson lesson : lessons) {
            if (!lessonName.equalsIgnoreCase(text(lesson.getLessonName())) || lesson.getTopics() == null) {
                continue;
            }
            for (LessonPlanTopic topic : lesson.getTopics()) {
                if (topicName.equalsIgnoreCase(text(topic.getTopicName()))) {
                    return topic;
                }
            }
        }
        return null;
    }

    private Map<String, Object> toPlainRow(int serial, String lessonName, String topicName) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("serial", serial);
        row.put("topicId", "");
        row.put("lessonName", lessonName);
        row.put("topicName", topicName);
        row.put("lessonTopicLabel", lessonName + " (" + topicName + ")");
        row.put("completionDate", "");
        row.put("status", "Incomplete");
        row.put("completed", false);
        return row;
    }

    private String rowKey(String lessonName, String topicName) {
        return text(lessonName).toLowerCase(Locale.ROOT) + "|" + text(topicName).toLowerCase(Locale.ROOT);
    }

    private void addUniqueSchedules(List<LessonPlanSchedule> target, List<LessonPlanSchedule> source) {
        if (source == null) {
            return;
        }
        for (LessonPlanSchedule schedule : source) {
            boolean exists = target.stream()
                    .anyMatch(existing -> existing.getId() != null && existing.getId().equals(schedule.getId()));
            if (!exists) {
                target.add(schedule);
            }
        }
    }

    private boolean matchesScheduleSubject(LessonPlanSchedule schedule, Subject subject) {
        if (schedule.getSubjectId() != null && subject.getId() != null
                && schedule.getSubjectId().equals(subject.getId())) {
            return true;
        }
        String scheduleCode = text(schedule.getSubjectCode());
        String subjectCode = text(subject.getSubjectCode());
        if (!scheduleCode.isBlank() && scheduleCode.equalsIgnoreCase(subjectCode)) {
            return true;
        }
        String scheduleName = text(schedule.getSubjectName()).toLowerCase(Locale.ROOT);
        String subjectName = text(subject.getName()).toLowerCase(Locale.ROOT);
        if (scheduleName.isEmpty() || subjectName.isEmpty()) {
            return false;
        }
        return scheduleName.equals(subjectName)
                || scheduleName.startsWith(subjectName)
                || subjectName.startsWith(scheduleName);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private void addUniqueLessons(List<LessonPlanLesson> target, List<LessonPlanLesson> source) {
        if (source == null) {
            return;
        }
        for (LessonPlanLesson lesson : source) {
            boolean exists = target.stream()
                    .anyMatch(existing -> existing.getId() != null && existing.getId().equals(lesson.getId()));
            if (!exists) {
                target.add(lesson);
            }
        }
    }

    private boolean matchesSubjectGroup(LessonPlanLesson lesson, SubjectGroup group) {
        if (lesson.getSubjectGroupId() != null && group.getId() != null
                && lesson.getSubjectGroupId().equals(group.getId())) {
            return true;
        }
        return lesson.getSubjectGroupName() != null && group.getName() != null
                && lesson.getSubjectGroupName().equalsIgnoreCase(group.getName());
    }

    private boolean matchesSubject(LessonPlanLesson lesson, Subject subject) {
        if (lesson.getSubjectId() != null && subject.getId() != null
                && lesson.getSubjectId().equals(subject.getId())) {
            return true;
        }
        if (lesson.getSubjectName() != null && subject.getName() != null
                && lesson.getSubjectName().equalsIgnoreCase(subject.getName())) {
            return true;
        }
        return lesson.getSubjectCode() != null && subject.getSubjectCode() != null
                && !subject.getSubjectCode().isBlank()
                && lesson.getSubjectCode().equalsIgnoreCase(subject.getSubjectCode());
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
        return createLesson(schoolClass, group, subject, lessonName, "A");
    }

    private LessonPlanLesson createLesson(SchoolClass schoolClass, SubjectGroup group, Subject subject,
                                          String lessonName, String section) {
        LessonPlanLesson lesson = LessonPlanLesson.builder()
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .section(section == null || section.isBlank() ? "A" : section.trim().toUpperCase(Locale.ROOT))
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
