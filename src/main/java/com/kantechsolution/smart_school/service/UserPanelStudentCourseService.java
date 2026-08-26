package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourse;
import com.kantechsolution.smart_school.model.OnlineCourseStudentProgress;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.OnlineCourseRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseStudentProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserPanelStudentCourseService {

    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final UserPanelContextService userPanelContextService;
    private final OnlineCourseRepository courseRepository;
    private final OnlineCourseStudentProgressRepository progressRepository;
    private final StudentCourseProgressSeedService seedService;
    private final OnlineCourseService onlineCourseService;
    private final OnlineCourseManageService onlineCourseManageService;

    public UserPanelStudentCourseService(
            UserPanelContextService userPanelContextService,
            OnlineCourseRepository courseRepository,
            OnlineCourseStudentProgressRepository progressRepository,
            StudentCourseProgressSeedService seedService,
            OnlineCourseService onlineCourseService,
            OnlineCourseManageService onlineCourseManageService
    ) {
        this.userPanelContextService = userPanelContextService;
        this.courseRepository = courseRepository;
        this.progressRepository = progressRepository;
        this.seedService = seedService;
        this.onlineCourseService = onlineCourseService;
        this.onlineCourseManageService = onlineCourseManageService;
    }

    @Transactional
    public Map<String, Object> getCourses(org.springframework.security.core.Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);
        onlineCourseService.getAllCourses();
        seedService.seedIfEmpty(student.getId());

        Map<Long, OnlineCourseStudentProgress> progressByCourse = progressRepository
                .findByStudentAdmissionId(student.getId())
                .stream()
                .collect(Collectors.toMap(OnlineCourseStudentProgress::getCourseId, row -> row, (a, b) -> a));

        List<Map<String, Object>> courses = new ArrayList<>();
        for (OnlineCourse course : courseRepository.findAllByOrderByIdDesc()) {
            if (!course.isPublished()) {
                continue;
            }
            OnlineCourseStudentProgress progress = progressByCourse.get(course.getId());
            courses.add(toCourseResponse(course, progress));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("courses", courses);
        return response;
    }

    @Transactional
    public Map<String, Object> getCourseDetail(
            org.springframework.security.core.Authentication authentication,
            Long courseId
    ) {
        StudentAdmission student = requireStudent(authentication);
        if (courseId == null) {
            throw new IllegalArgumentException("Course is required");
        }

        OnlineCourse course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        if (!course.isPublished()) {
            throw new IllegalArgumentException("Course not available");
        }

        onlineCourseService.getAllCourses();
        seedService.seedIfEmpty(student.getId());

        Map<String, Object> managePayload = onlineCourseManageService.getManagePayload(courseId);
        OnlineCourseStudentProgress progress = progressRepository
                .findByStudentAdmissionIdAndCourseId(student.getId(), courseId)
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("course", toCourseResponse(course, progress));
        response.put("sections", managePayload.get("sections"));
        return response;
    }

    private Map<String, Object> toCourseResponse(OnlineCourse course, OnlineCourseStudentProgress progress) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", course.getId());
        map.put("title", course.getTitle());
        map.put("description", course.getDescription() == null ? "" : course.getDescription());
        map.put("category", course.getCategory() == null ? "" : course.getCategory());
        map.put("classLabel", course.getClassLabel() == null ? "" : course.getClassLabel());
        map.put("instructorName", course.getInstructorName() == null ? "" : course.getInstructorName());
        map.put("instructorCode", course.getInstructorCode() == null ? "" : course.getInstructorCode());
        map.put("thumbnailUrl", course.getThumbnailUrl());
        map.put("themeColor", course.getThemeColor() == null ? "#727cf5" : course.getThemeColor());
        map.put("lastUpdatedDisplay", course.getLastUpdated() != null
                ? DISPLAY_DATE.format(course.getLastUpdated())
                : "");
        map.put("lessonCount", course.getLessonCount() == null ? 0 : course.getLessonCount());
        map.put("lessonDuration", course.getLessonDuration() == null ? "" : course.getLessonDuration());
        map.put("examCount", course.getExamCount() == null ? 0 : course.getExamCount());
        map.put("quizCount", course.getQuizCount() == null ? 0 : course.getQuizCount());
        map.put("assignmentCount", course.getAssignmentCount() == null ? 0 : course.getAssignmentCount());
        map.put("price", course.getPrice() == null ? 0.0 : course.getPrice());
        map.put("discountPrice", course.getDiscountPrice());
        map.put("freeCourse", course.isFreeCourse());
        map.put("previewUrl", course.getPreviewUrl() == null ? "" : course.getPreviewUrl());
        map.put("outcomes", course.getOutcomes() == null ? "" : course.getOutcomes());
        map.put("sectionLabels", course.getSectionLabels() == null ? "" : course.getSectionLabels());

        int progressPercent = progress != null && progress.getProgressPercent() != null
                ? progress.getProgressPercent()
                : 0;
        int ratingCount = progress != null && progress.getRatingCount() != null
                ? progress.getRatingCount()
                : 0;
        boolean certificateAvailable = progress != null && progress.isCertificateAvailable();

        map.put("progressPercent", progressPercent);
        map.put("ratingCount", ratingCount);
        map.put("certificateAvailable", certificateAvailable || progressPercent >= 100);
        return map;
    }

    private StudentAdmission requireStudent(org.springframework.security.core.Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }
}
