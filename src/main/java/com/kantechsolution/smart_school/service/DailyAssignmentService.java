package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.DailyAssignment;
import com.kantechsolution.smart_school.repository.DailyAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyAssignmentService {

    private final DailyAssignmentRepository dailyAssignmentRepository;

    public List<DailyAssignment> getAllAssignments() {
        return dailyAssignmentRepository.findByIsActiveTrueOrderByAssignmentDateDescCreatedAtDesc();
    }

    public List<DailyAssignment> searchAssignments(Long classId, String section, Long subjectGroupId,
                                                   Long subjectId, LocalDate assignmentDate) {
        if (classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null || assignmentDate == null) {
            throw new IllegalArgumentException("Class, section, subject group, subject, and date are required.");
        }
        return dailyAssignmentRepository.searchAssignments(classId, section.trim(), subjectGroupId, subjectId, assignmentDate);
    }

    public Optional<DailyAssignment> getAssignmentById(Long id) {
        return dailyAssignmentRepository.findById(id)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()));
    }

    @Transactional
    public DailyAssignment createAssignment(Map<String, Object> payload) {
        DailyAssignment assignment = buildFromPayload(new DailyAssignment(), payload);
        return dailyAssignmentRepository.save(assignment);
    }

    @Transactional
    public DailyAssignment updateAssignment(Long id, Map<String, Object> payload) {
        DailyAssignment assignment = dailyAssignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Daily assignment not found"));
        buildFromPayload(assignment, payload);
        return dailyAssignmentRepository.save(assignment);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        DailyAssignment assignment = dailyAssignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Daily assignment not found"));
        assignment.setIsActive(false);
        dailyAssignmentRepository.save(assignment);
    }

    private DailyAssignment buildFromPayload(DailyAssignment assignment, Map<String, Object> payload) {
        assignment.setStudentAdmissionId(longValue(payload.get("studentAdmissionId")));
        assignment.setStudentName(requiredText(payload.get("studentName"), "Student name is required"));
        assignment.setClassId(longValue(payload.get("classId")));
        assignment.setClassName(requiredText(payload.get("className"), "Class is required"));
        assignment.setSection(requiredText(payload.get("section"), "Section is required"));
        assignment.setSubjectGroupId(longValue(payload.get("subjectGroupId")));
        assignment.setSubjectGroupName(requiredText(payload.get("subjectGroupName"), "Subject group is required"));
        assignment.setSubjectId(longValue(payload.get("subjectId")));
        assignment.setSubjectName(requiredText(payload.get("subjectName"), "Subject is required"));
        assignment.setTitle(requiredText(payload.get("title"), "Title is required"));
        assignment.setAssignmentDate(parseDate(payload.get("assignmentDate"), "Assignment date is required"));
        assignment.setSubmissionDate(parseOptionalDate(payload.get("submissionDate")));
        assignment.setEvaluationDate(parseOptionalDate(payload.get("evaluationDate")));
        assignment.setEvaluatedBy(text(payload.get("evaluatedBy")));
        assignment.setIsActive(true);
        return assignment;
    }

    private String requiredText(Object value, String message) {
        String result = text(value);
        if (result == null || result.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return result.trim();
    }

    private String text(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private Long longValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.valueOf(String.valueOf(value).trim());
    }

    private LocalDate parseDate(Object value, String message) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return LocalDate.parse(String.valueOf(value).trim());
    }

    private LocalDate parseOptionalDate(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return LocalDate.parse(String.valueOf(value).trim());
    }
}
