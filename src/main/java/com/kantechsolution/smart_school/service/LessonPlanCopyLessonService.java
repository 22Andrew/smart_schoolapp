package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.LessonPlanLesson;
import com.kantechsolution.smart_school.model.LessonPlanTopic;
import com.kantechsolution.smart_school.repository.LessonPlanLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Order(14)
public class LessonPlanCopyLessonService implements ApplicationRunner {

    private final LessonPlanLessonRepository lessonRepository;
    private final AcademicSessionService academicSessionService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        backfillSessions();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchOldLessons(
            String sessionName, Long classId, String section, Long subjectGroupId, Long subjectId) {
        validateSearchParams(sessionName, classId, section, subjectGroupId, subjectId);

        return lessonRepository
                .findByAcademicSessionIgnoreCaseAndClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                        sessionName.trim(), classId, section.trim(), subjectGroupId, subjectId)
                .stream()
                .map(this::toRow)
                .toList();
    }

    @Transactional
    public Map<String, Object> copyLessons(Map<String, Object> payload) {
        String sessionName = asString(payload.get("sessionName"));
        Long classId = asLong(payload.get("classId"));
        String section = asString(payload.get("section"));
        Long subjectGroupId = asLong(payload.get("subjectGroupId"));
        Long subjectId = asLong(payload.get("subjectId"));
        validateSearchParams(sessionName, classId, section, subjectGroupId, subjectId);

        String currentSession = academicSessionService.getCurrentSessionName();
        if (currentSession.equalsIgnoreCase(sessionName.trim())) {
            throw new IllegalArgumentException("Select an old session different from the current session");
        }

        List<LessonPlanLesson> sourceLessons = lessonRepository
                .findByAcademicSessionIgnoreCaseAndClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                        sessionName.trim(), classId, section.trim(), subjectGroupId, subjectId);
        if (sourceLessons.isEmpty()) {
            throw new IllegalArgumentException("No lessons found for the selected criteria");
        }

        int copiedCount = 0;
        for (LessonPlanLesson source : sourceLessons) {
            boolean exists = lessonRepository
                    .findByAcademicSessionIgnoreCaseAndClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                            currentSession, classId, section.trim(), subjectGroupId, subjectId)
                    .stream()
                    .anyMatch(item -> item.getLessonName().equalsIgnoreCase(source.getLessonName()));
            if (exists) {
                continue;
            }

            LessonPlanLesson copy = LessonPlanLesson.builder()
                    .classId(source.getClassId())
                    .className(source.getClassName())
                    .section(source.getSection())
                    .subjectGroupId(source.getSubjectGroupId())
                    .subjectGroupName(source.getSubjectGroupName())
                    .subjectId(source.getSubjectId())
                    .subjectName(source.getSubjectName())
                    .subjectCode(source.getSubjectCode())
                    .lessonName(source.getLessonName())
                    .academicSession(currentSession)
                    .topics(new ArrayList<>())
                    .build();

            if (source.getTopics() != null) {
                for (LessonPlanTopic topic : source.getTopics()) {
                    copy.getTopics().add(LessonPlanTopic.builder()
                            .lesson(copy)
                            .topicName(topic.getTopicName())
                            .build());
                }
            }

            lessonRepository.save(copy);
            copiedCount++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("copiedCount", copiedCount);
        result.put("currentSession", currentSession);
        return result;
    }

    private Map<String, Object> toRow(LessonPlanLesson lesson) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", lesson.getId());
        row.put("lessonName", lesson.getLessonName());
        row.put("topics", lesson.getTopics().stream().map(LessonPlanTopic::getTopicName).toList());
        row.put("topicText", lesson.getTopics().stream()
                .map(LessonPlanTopic::getTopicName)
                .reduce((a, b) -> a + ", " + b)
                .orElse(""));
        return row;
    }

    private void validateSearchParams(String sessionName, Long classId, String section,
                                      Long subjectGroupId, Long subjectId) {
        if (sessionName == null || sessionName.isBlank()
                || classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null) {
            throw new IllegalArgumentException("Session, Class, Section, Subject Group, and Subject are required");
        }
    }

    private void backfillSessions() {
        String currentSession = academicSessionService.getCurrentSessionName();
        String oldSession = "2023-24";
        List<LessonPlanLesson> lessons = lessonRepository.findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc();
        if (lessons.isEmpty()) {
            return;
        }

        boolean updated = false;
        for (int i = 0; i < lessons.size(); i++) {
            LessonPlanLesson lesson = lessons.get(i);
            if (lesson.getAcademicSession() != null && !lesson.getAcademicSession().isBlank()) {
                continue;
            }
            lesson.setAcademicSession(i % 2 == 0 ? oldSession : currentSession);
            lessonRepository.save(lesson);
            updated = true;
        }

        if (!updated && lessonRepository.findByAcademicSessionIgnoreCaseAndClassIdAndSectionIgnoreCaseAndSubjectGroupIdAndSubjectIdOrderByLessonNameAsc(
                oldSession, lessons.get(0).getClassId(), lessons.get(0).getSection(),
                lessons.get(0).getSubjectGroupId(), lessons.get(0).getSubjectId()).isEmpty()) {
            LessonPlanLesson sample = lessons.get(0);
            LessonPlanLesson oldCopy = LessonPlanLesson.builder()
                    .classId(sample.getClassId())
                    .className(sample.getClassName())
                    .section(sample.getSection())
                    .subjectGroupId(sample.getSubjectGroupId())
                    .subjectGroupName(sample.getSubjectGroupName())
                    .subjectId(sample.getSubjectId())
                    .subjectName(sample.getSubjectName())
                    .subjectCode(sample.getSubjectCode())
                    .lessonName("Previous Session Lesson")
                    .academicSession(oldSession)
                    .topics(new ArrayList<>())
                    .build();
            oldCopy.getTopics().add(LessonPlanTopic.builder()
                    .lesson(oldCopy)
                    .topicName("Intro Topic")
                    .build());
            lessonRepository.save(oldCopy);
        }
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
}
