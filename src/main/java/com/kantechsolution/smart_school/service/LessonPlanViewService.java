package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(13)
public class LessonPlanViewService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final LessonPlanScheduleRepository scheduleRepository;
    private final LessonPlanDetailRepository detailRepository;
    private final LessonPlanCommentRepository commentRepository;
    private final LessonPlanLessonRepository lessonRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (detailRepository.count() == 0) {
            seedSampleDetails();
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getViewData(Long scheduleId) {
        LessonPlanSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson plan not found"));

        LessonPlanDetail detail = detailRepository.findByScheduleId(scheduleId)
                .orElseGet(() -> buildInferredDetail(schedule));

        List<Map<String, Object>> comments = commentRepository
                .findByScheduleIdOrderByCreatedAtAsc(scheduleId)
                .stream()
                .map(this::toCommentMap)
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("scheduleId", schedule.getId());
        response.put("classLabel", schedule.getClassName() + "(" + schedule.getSection() + ")");
        response.put("subjectLabel", formatSubjectLabel(schedule));
        response.put("dateLabel", formatDateLabel(schedule));
        response.put("lessonName", valueOrEmpty(detail.getLessonName()));
        response.put("topicName", valueOrEmpty(detail.getTopicName()));
        response.put("subTopic", valueOrEmpty(detail.getSubTopic()));
        response.put("generalObjectives", valueOrEmpty(detail.getGeneralObjectives()));
        response.put("teachingMethod", valueOrEmpty(detail.getTeachingMethod()));
        response.put("previousKnowledge", valueOrEmpty(detail.getPreviousKnowledge()));
        response.put("comprehensiveQuestions", valueOrEmpty(detail.getComprehensiveQuestions()));
        response.put("presentation", valueOrEmpty(detail.getPresentation()));
        response.put("comments", comments);
        return response;
    }

    @Transactional
    public Map<String, Object> addComment(Long scheduleId, Map<String, Object> payload) {
        if (!scheduleRepository.existsById(scheduleId)) {
            throw new IllegalArgumentException("Lesson plan not found");
        }

        String commentText = payload.get("commentText") == null
                ? ""
                : String.valueOf(payload.get("commentText")).trim();
        if (commentText.isEmpty()) {
            throw new IllegalArgumentException("Comment is required");
        }

        LessonPlanComment saved = commentRepository.save(LessonPlanComment.builder()
                .scheduleId(scheduleId)
                .commentText(commentText)
                .build());
        return toCommentMap(saved);
    }

    private LessonPlanDetail buildInferredDetail(LessonPlanSchedule schedule) {
        String lessonName = "";
        String topicName = "";

        if (schedule.getClassId() != null && schedule.getSubjectId() != null) {
            List<LessonPlanLesson> lessons = lessonRepository.findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc().stream()
                    .filter(lesson -> Objects.equals(lesson.getClassId(), schedule.getClassId())
                            && lesson.getSection() != null
                            && lesson.getSection().equalsIgnoreCase(schedule.getSection())
                            && lesson.getSubjectId() != null
                            && lesson.getSubjectId().equals(schedule.getSubjectId()))
                    .toList();

            if (lessons.isEmpty()) {
                lessons = lessonRepository.findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc().stream()
                        .filter(lesson -> lesson.getClassName().equalsIgnoreCase(schedule.getClassName())
                                && lesson.getSection().equalsIgnoreCase(schedule.getSection())
                                && lesson.getSubjectName().equalsIgnoreCase(schedule.getSubjectName()))
                        .toList();
            }

            if (!lessons.isEmpty()) {
                LessonPlanLesson lesson = lessons.get(0);
                lessonName = lesson.getLessonName();
                if (lesson.getTopics() != null && !lesson.getTopics().isEmpty()) {
                    topicName = lesson.getTopics().get(0).getTopicName();
                }
            }
        }

        return LessonPlanDetail.builder()
                .scheduleId(schedule.getId())
                .lessonName(lessonName)
                .topicName(topicName)
                .build();
    }

    private Map<String, Object> toCommentMap(LessonPlanComment comment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", comment.getId());
        row.put("commentText", comment.getCommentText());
        row.put("createdAt", comment.getCreatedAt());
        return row;
    }

    private String formatSubjectLabel(LessonPlanSchedule schedule) {
        if (schedule.getSubjectCode() != null && !schedule.getSubjectCode().isBlank()) {
            return schedule.getSubjectName() + " (" + schedule.getSubjectCode() + ")";
        }
        return schedule.getSubjectName();
    }

    private String formatDateLabel(LessonPlanSchedule schedule) {
        String date = schedule.getPlanDate().format(US_DATE);
        return date + " " + formatDisplayTime(schedule.getTimeFrom())
                + " To " + formatDisplayTime(schedule.getTimeTo());
    }

    private String formatDisplayTime(java.time.LocalTime time) {
        if (time == null) {
            return "";
        }
        int hours = time.getHour();
        int minutes = time.getMinute();
        String suffix = hours >= 12 ? "PM" : "AM";
        int displayHour = hours % 12;
        if (displayHour == 0) {
            displayHour = 12;
        }
        return displayHour + ":" + String.format("%02d", minutes) + " " + suffix;
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private void seedSampleDetails() {
        scheduleRepository.findAll().forEach(schedule -> {
            if (detailRepository.findByScheduleId(schedule.getId()).isPresent()) {
                return;
            }

            LessonPlanDetail detail = buildInferredDetail(schedule);

            if ("English".equalsIgnoreCase(schedule.getSubjectName())) {
                detail.setLessonName("The Grasshopper and the Ant");
                detail.setTopicName("The Ant");
            }

            detailRepository.save(detail);
        });
    }
}
