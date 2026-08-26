package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentTimeline;
import com.kantechsolution.smart_school.repository.StudentTimelineRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelTimelineService {

    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.US);

    private final UserPanelContextService userPanelContextService;
    private final StudentTimelineRepository studentTimelineRepository;
    private final StudentTimelineProfileSeedService timelineProfileSeedService;

    public UserPanelTimelineService(
            UserPanelContextService userPanelContextService,
            StudentTimelineRepository studentTimelineRepository,
            StudentTimelineProfileSeedService timelineProfileSeedService
    ) {
        this.userPanelContextService = userPanelContextService;
        this.studentTimelineRepository = studentTimelineRepository;
        this.timelineProfileSeedService = timelineProfileSeedService;
    }

    @Transactional
    public Map<String, Object> getTimeline(Authentication authentication) {
        StudentAdmission student = requireStudent(authentication);
        timelineProfileSeedService.seedIfEmpty(student.getId());

        List<Map<String, Object>> entries = studentTimelineRepository
                .findByStudentAdmissionIdAndVisibleToStudentTrueOrderByEventDateAscIdAsc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId", student.getId());
        response.put("entries", entries);
        return response;
    }

    private Map<String, Object> toResponse(StudentTimeline entry) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", entry.getId());
        row.put("title", entry.getTitle());
        row.put("description", entry.getDescription() == null ? "" : entry.getDescription());
        row.put("date", entry.getEventDate() != null
                ? entry.getEventDate().format(DISPLAY_DATE)
                : "");
        row.put("node", entry.getNodeType() == null ? "calendar" : entry.getNodeType());
        return row;
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null) {
            throw new IllegalArgumentException("Student profile not found");
        }
        return student;
    }
}
