package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.OnlineCourse;
import com.kantechsolution.smart_school.model.OnlineCourseContent;
import com.kantechsolution.smart_school.model.OnlineCourseSection;
import com.kantechsolution.smart_school.repository.OnlineCourseContentRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseSectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OnlineCourseManageService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    @Autowired
    private OnlineCourseRepository onlineCourseRepository;

    @Autowired
    private OnlineCourseSectionRepository sectionRepository;

    @Autowired
    private OnlineCourseContentRepository contentRepository;

    @Autowired
    private UploadStorage uploadStorage;

    @Transactional
    public Map<String, Object> getManagePayload(Long courseId) {
        OnlineCourse course = requireCourse(courseId);
        ensureDemoCurriculum(course);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("course", toCourseDetail(course));
        payload.put("sections", toSections(course.getId()));
        return payload;
    }

    @Transactional
    public Map<String, Object> addSection(Long courseId, Map<String, Object> body) {
        OnlineCourse course = requireCourse(courseId);
        String title = text(body.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Section title is required");
        }

        OnlineCourseSection section = new OnlineCourseSection();
        section.setCourse(course);
        section.setTitle(title);
        section.setSortOrder((int) sectionRepository.countByCourseId(courseId) + 1);
        sectionRepository.save(section);
        return toSectionRow(section, List.of());
    }

    @Transactional
    public Map<String, Object> updateSection(Long sectionId, Map<String, Object> body) {
        OnlineCourseSection section = requireSection(sectionId);
        String title = text(body.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Section title is required");
        }
        section.setTitle(title);
        sectionRepository.save(section);
        return toSectionRow(section, contentRepository.findBySectionIdOrderBySortOrderAscIdAsc(sectionId));
    }

    @Transactional
    public void deleteSection(Long sectionId) {
        OnlineCourseSection section = requireSection(sectionId);
        Long courseId = section.getCourse().getId();
        sectionRepository.delete(section);
        refreshCourseCounts(courseId);
    }

    @Transactional
    public Map<String, Object> addContent(Long sectionId, Map<String, Object> body) {
        OnlineCourseSection section = requireSection(sectionId);
        OnlineCourseContent.ContentType type = parseType(body.get("contentType"));
        String title = text(body.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }

        OnlineCourseContent content = new OnlineCourseContent();
        content.setSection(section);
        content.setContentType(type);
        content.setTitle(title);
        content.setSortOrder((int) contentRepository.countBySectionId(sectionId) + 1);
        applyContentFields(content, body);
        contentRepository.save(content);
        refreshCourseCounts(section.getCourse().getId());
        return toContentRow(content);
    }

    @Transactional
    public Map<String, Object> addLesson(Long sectionId, Map<String, Object> body, MultipartFile previewImage) {
        OnlineCourseSection section = requireSection(sectionId);
        String title = text(body.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        String lessonType = text(body.get("lessonType"));
        if (lessonType.isBlank()) {
            throw new IllegalArgumentException("Lesson Type is required");
        }
        if (previewImage == null || previewImage.isEmpty()) {
            throw new IllegalArgumentException("Inline Preview Image is required");
        }

        OnlineCourseContent content = new OnlineCourseContent();
        content.setSection(section);
        content.setContentType(OnlineCourseContent.ContentType.LESSON);
        content.setTitle(title);
        content.setLessonType(lessonType);
        content.setSummary(text(body.get("summary")));
        content.setDuration(text(body.get("duration")));
        content.setVideoUrl(text(body.get("videoUrl")));
        content.setThumbnailUrl(storeLessonImage(previewImage));
        content.setSortOrder((int) contentRepository.countBySectionId(sectionId) + 1);
        contentRepository.save(content);
        refreshCourseCounts(section.getCourse().getId());
        return toContentRow(content);
    }

    private String storeLessonImage(MultipartFile file) {
        try {
            String original = file.getOriginalFilename() == null ? "lesson.jpg" : file.getOriginalFilename();
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                ext = original.substring(dot);
            }
            String filename = UUID.randomUUID() + ext;
            Path target = uploadStorage.getLessonsDir().resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/lessons/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store lesson image: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> updateContent(Long contentId, Map<String, Object> body) {
        OnlineCourseContent content = requireContent(contentId);
        String title = text(body.get("title"));
        if (!title.isBlank()) {
            content.setTitle(title);
        }
        if (body.get("contentType") != null) {
            content.setContentType(parseType(body.get("contentType")));
        }
        applyContentFields(content, body);
        contentRepository.save(content);
        refreshCourseCounts(content.getSection().getCourse().getId());
        return toContentRow(content);
    }

    @Transactional
    public void deleteContent(Long contentId) {
        OnlineCourseContent content = requireContent(contentId);
        Long courseId = content.getSection().getCourse().getId();
        contentRepository.delete(content);
        refreshCourseCounts(courseId);
    }

    @Transactional
    public Map<String, Object> reorderCourse(Long courseId, Map<String, Object> body) {
        OnlineCourse course = requireCourse(courseId);
        Object sectionsObj = body.get("sections");
        if (!(sectionsObj instanceof List<?> sectionList) || sectionList.isEmpty()) {
            throw new IllegalArgumentException("Sections order is required");
        }

        List<OnlineCourseSection> existingSections = sectionRepository.findByCourseIdOrderBySortOrderAscIdAsc(courseId);
        Map<Long, OnlineCourseSection> sectionMap = new LinkedHashMap<>();
        for (OnlineCourseSection section : existingSections) {
            sectionMap.put(section.getId(), section);
        }

        int sectionOrder = 1;
        for (Object sectionEntry : sectionList) {
            if (!(sectionEntry instanceof Map<?, ?> sectionRow)) {
                continue;
            }
            Long sectionId = asLong(sectionRow.get("id"));
            if (sectionId == null || !sectionMap.containsKey(sectionId)) {
                throw new IllegalArgumentException("Invalid section in order payload");
            }
            OnlineCourseSection section = sectionMap.get(sectionId);
            section.setSortOrder(sectionOrder++);
            sectionRepository.save(section);

            Object contentsObj = sectionRow.get("contents");
            if (!(contentsObj instanceof List<?> contentIds)) {
                continue;
            }
            List<OnlineCourseContent> existingContents =
                    contentRepository.findBySectionIdOrderBySortOrderAscIdAsc(sectionId);
            Map<Long, OnlineCourseContent> contentMap = new LinkedHashMap<>();
            for (OnlineCourseContent content : existingContents) {
                contentMap.put(content.getId(), content);
            }

            int contentOrder = 1;
            for (Object contentIdObj : contentIds) {
                Long contentId = asLong(contentIdObj);
                if (contentId == null || !contentMap.containsKey(contentId)) {
                    throw new IllegalArgumentException("Invalid content in order payload");
                }
                OnlineCourseContent content = contentMap.get(contentId);
                content.setSortOrder(contentOrder++);
                // Keep content within its section (nested reorder within section)
                content.setSection(section);
                contentRepository.save(content);
            }
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("course", toCourseDetail(course));
        payload.put("sections", toSections(courseId));
        return payload;
    }

    @Transactional
    public Map<String, Object> togglePublish(Long courseId) {
        OnlineCourse course = requireCourse(courseId);
        course.setPublished(!course.isPublished());
        onlineCourseRepository.save(course);
        return toCourseDetail(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        OnlineCourse course = requireCourse(courseId);
        List<OnlineCourseSection> sections = sectionRepository.findByCourseIdOrderBySortOrderAscIdAsc(courseId);
        sectionRepository.deleteAll(sections);
        onlineCourseRepository.delete(course);
    }

    private void ensureDemoCurriculum(OnlineCourse course) {
        if (sectionRepository.countByCourseId(course.getId()) > 0) {
            return;
        }
        // Seed a demo section for courses that already have lesson/exam counts (seeded samples)
        if ((course.getLessonCount() == null || course.getLessonCount() == 0)
                && (course.getExamCount() == null || course.getExamCount() == 0)
                && (course.getQuizCount() == null || course.getQuizCount() == 0)
                && (course.getAssignmentCount() == null || course.getAssignmentCount() == 0)) {
            return;
        }

        OnlineCourseSection section = new OnlineCourseSection();
        section.setCourse(course);
        section.setTitle("Introduction to " + shortTitle(course.getTitle()));
        section.setSortOrder(1);
        sectionRepository.save(section);

        int order = 1;
        if (course.getLessonCount() != null && course.getLessonCount() > 0) {
            OnlineCourseContent lesson1 = content(section, OnlineCourseContent.ContentType.LESSON,
                    "Lesson 1: Body Parts", order++, "00:55:51",
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ", null);
            contentRepository.save(lesson1);
        }
        if (course.getQuizCount() != null && course.getQuizCount() > 0) {
            contentRepository.save(content(section, OnlineCourseContent.ContentType.QUIZ,
                    "Quiz 1: Quiz", order++, null, null, null));
        }
        if (course.getExamCount() != null && course.getExamCount() > 0) {
            OnlineCourseContent exam = content(section, OnlineCourseContent.ContentType.EXAM,
                    "Exam 1: Computer Exam", order++, null, null, null);
            exam.setExamDuration("01:00:00");
            exam.setPassingPercentage(33);
            contentRepository.save(exam);
        }
        if (course.getAssignmentCount() != null && course.getAssignmentCount() > 0) {
            OnlineCourseContent assignment = content(section, OnlineCourseContent.ContentType.ASSIGNMENT,
                    "Assignment 1: Assessment (Section 1)", order++, null, null, null);
            assignment.setMaxMarks(50.0);
            contentRepository.save(assignment);
        }
        if (course.getLessonCount() != null && course.getLessonCount() > 1) {
            OnlineCourseContent lesson2 = content(section, OnlineCourseContent.ContentType.LESSON,
                    "Lesson 2: Introduction", order++,
                    course.getLessonDuration() == null ? "01:51:55" : course.getLessonDuration().replace(" H", ""),
                    course.getPreviewUrl(),
                    "What is a computer Uses of computer Types of computers");
            contentRepository.save(lesson2);
        }
        if (course.getQuizCount() != null && course.getQuizCount() > 1) {
            contentRepository.save(content(section, OnlineCourseContent.ContentType.QUIZ,
                    "Quiz 2: Basics", order++, null, null, null));
        }
        if (course.getAssignmentCount() != null && course.getAssignmentCount() > 1) {
            OnlineCourseContent assignment2 = content(section, OnlineCourseContent.ContentType.ASSIGNMENT,
                    "Assignment 2: Assessment", order, null, null, null);
            assignment2.setMaxMarks(50.0);
            contentRepository.save(assignment2);
        }
    }

    private OnlineCourseContent content(OnlineCourseSection section,
                                        OnlineCourseContent.ContentType type,
                                        String title,
                                        int sortOrder,
                                        String duration,
                                        String videoUrl,
                                        String summary) {
        OnlineCourseContent item = new OnlineCourseContent();
        item.setSection(section);
        item.setContentType(type);
        item.setTitle(title);
        item.setSortOrder(sortOrder);
        item.setDuration(duration);
        item.setVideoUrl(videoUrl);
        item.setSummary(summary);
        return item;
    }

    private void refreshCourseCounts(Long courseId) {
        OnlineCourse course = requireCourse(courseId);
        List<OnlineCourseSection> sections = sectionRepository.findByCourseIdOrderBySortOrderAscIdAsc(courseId);
        int lessons = 0;
        int quizzes = 0;
        int exams = 0;
        int assignments = 0;
        for (OnlineCourseSection section : sections) {
            for (OnlineCourseContent content : contentRepository.findBySectionIdOrderBySortOrderAscIdAsc(section.getId())) {
                switch (content.getContentType()) {
                    case LESSON -> lessons++;
                    case QUIZ -> quizzes++;
                    case EXAM -> exams++;
                    case ASSIGNMENT -> assignments++;
                }
            }
        }
        course.setLessonCount(lessons);
        course.setQuizCount(quizzes);
        course.setExamCount(exams);
        course.setAssignmentCount(assignments);
        onlineCourseRepository.save(course);
    }

    private List<Map<String, Object>> toSections(Long courseId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        List<OnlineCourseSection> sections = sectionRepository.findByCourseIdOrderBySortOrderAscIdAsc(courseId);
        int index = 1;
        for (OnlineCourseSection section : sections) {
            List<OnlineCourseContent> contents = contentRepository.findBySectionIdOrderBySortOrderAscIdAsc(section.getId());
            Map<String, Object> row = toSectionRow(section, contents);
            row.put("displayIndex", index++);
            rows.add(row);
        }
        return rows;
    }

    private Map<String, Object> toSectionRow(OnlineCourseSection section, List<OnlineCourseContent> contents) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", section.getId());
        row.put("title", section.getTitle());
        row.put("sortOrder", section.getSortOrder());
        List<Map<String, Object>> items = new ArrayList<>();
        for (OnlineCourseContent content : contents) {
            items.add(toContentRow(content));
        }
        row.put("contents", items);
        return row;
    }

    private Map<String, Object> toContentRow(OnlineCourseContent content) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", content.getId());
        row.put("sectionId", content.getSection().getId());
        row.put("contentType", content.getContentType().name());
        row.put("title", content.getTitle());
        row.put("sortOrder", content.getSortOrder());
        row.put("duration", content.getDuration());
        row.put("lessonType", content.getLessonType());
        row.put("thumbnailUrl", content.getThumbnailUrl());
        row.put("videoUrl", content.getVideoUrl());
        row.put("summary", content.getSummary());
        row.put("examFrom", content.getExamFrom() == null ? "" : DATE_FMT.format(content.getExamFrom()));
        row.put("examTo", content.getExamTo() == null ? "" : DATE_FMT.format(content.getExamTo()));
        row.put("examDuration", content.getExamDuration());
        row.put("passingPercentage", content.getPassingPercentage());
        row.put("assignmentDate", content.getAssignmentDate() == null ? "" : DATE_FMT.format(content.getAssignmentDate()));
        row.put("submissionDate", content.getSubmissionDate() == null ? "" : DATE_FMT.format(content.getSubmissionDate()));
        row.put("maxMarks", content.getMaxMarks());
        return row;
    }

    private Map<String, Object> toCourseDetail(OnlineCourse course) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", course.getId());
        row.put("title", course.getTitle());
        row.put("description", course.getDescription());
        row.put("classLabel", course.getClassLabel());
        row.put("sectionLabels", course.getSectionLabels());
        row.put("instructorName", course.getInstructorName());
        row.put("instructorCode", course.getInstructorCode());
        row.put("thumbnailUrl", course.getThumbnailUrl());
        row.put("themeColor", course.getThemeColor());
        row.put("createdByName", blankTo(course.getCreatedByName(), "Joe Black"));
        row.put("createdByCode", blankTo(course.getCreatedByCode(), "9000"));
        row.put("published", course.isPublished());
        return row;
    }

    private void applyContentFields(OnlineCourseContent content, Map<String, Object> body) {
        if (body.containsKey("duration")) content.setDuration(text(body.get("duration")));
        if (body.containsKey("lessonType")) content.setLessonType(text(body.get("lessonType")));
        if (body.containsKey("thumbnailUrl")) content.setThumbnailUrl(text(body.get("thumbnailUrl")));
        if (body.containsKey("videoUrl")) content.setVideoUrl(text(body.get("videoUrl")));
        if (body.containsKey("summary")) content.setSummary(text(body.get("summary")));
        if (body.containsKey("examDuration")) content.setExamDuration(text(body.get("examDuration")));
        if (body.containsKey("passingPercentage")) content.setPassingPercentage(asInt(body.get("passingPercentage")));
        if (body.containsKey("maxMarks")) content.setMaxMarks(asDouble(body.get("maxMarks")));
        if (body.containsKey("examFrom")) content.setExamFrom(asDate(body.get("examFrom")));
        if (body.containsKey("examTo")) content.setExamTo(asDate(body.get("examTo")));
        if (body.containsKey("assignmentDate")) content.setAssignmentDate(asDate(body.get("assignmentDate")));
        if (body.containsKey("submissionDate")) content.setSubmissionDate(asDate(body.get("submissionDate")));
    }

    private OnlineCourse requireCourse(Long id) {
        return onlineCourseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    private OnlineCourseSection requireSection(Long id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));
    }

    private OnlineCourseContent requireContent(Long id) {
        return contentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Content not found"));
    }

    private OnlineCourseContent.ContentType parseType(Object value) {
        try {
            return OnlineCourseContent.ContentType.valueOf(text(value).toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid content type");
        }
    }

    private String shortTitle(String title) {
        if (title == null || title.isBlank()) return "Course";
        String cleaned = title.replace("Course for Beginners", "").replace("Course", "").trim();
        return cleaned.isBlank() ? title : cleaned;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Integer asInt(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) return null;
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number value");
        }
    }

    private Long asLong(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) return null;
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid id value");
        }
    }

    private Double asDouble(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) return null;
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number value");
        }
    }

    private LocalDate asDate(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        try {
            return LocalDate.parse(text, DATE_FMT);
        } catch (Exception ignored) {
            try {
                return LocalDate.parse(text);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date value");
            }
        }
    }
}
