package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.DailyAssignment;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.DailyAssignmentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelDailyAssignmentService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final UserPanelContextService contextService;
    private final DailyAssignmentRepository assignmentRepository;

    public UserPanelDailyAssignmentService(UserPanelContextService contextService,
                                           DailyAssignmentRepository assignmentRepository) {
        this.contextService = contextService;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional
    public Map<String, Object> listAssignments(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String className = resolveClassName(student);
        String section = resolveSection(student);
        Long classId = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getId()
                : null;
        Long studentId = student != null ? student.getId() : null;
        String studentName = contextService.resolveStudentName(student);

        ensureDemoAssignment(studentId, studentName, className, section, classId);

        List<DailyAssignment> items = studentId != null
                ? assignmentRepository.findByStudentAdmissionIdAndIsActiveTrueOrderByAssignmentDateDescCreatedAtDesc(studentId)
                : assignmentRepository.findByClassNameIgnoreCaseAndSectionIgnoreCaseAndIsActiveTrueOrderByAssignmentDateDescCreatedAtDesc(
                        className, section);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (DailyAssignment assignment : items) {
            rows.add(toRow(assignment));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    private void ensureDemoAssignment(Long studentId, String studentName, String className,
                                      String section, Long classId) {
        if (studentId != null && assignmentRepository.existsByStudentAdmissionIdAndIsActiveTrue(studentId)) {
            return;
        }
        if (studentId == null && !assignmentRepository
                .findByClassNameIgnoreCaseAndSectionIgnoreCaseAndIsActiveTrueOrderByAssignmentDateDescCreatedAtDesc(className, section)
                .isEmpty()) {
            return;
        }

        DailyAssignment assignment = DailyAssignment.builder()
                .studentAdmissionId(studentId)
                .studentName(studentName == null || studentName.isBlank() ? "Edward Thomas" : studentName)
                .classId(classId)
                .className(className)
                .section(section)
                .subjectGroupName("Class 1 subject")
                .subjectName("Social Studies (212)")
                .title("Neighbourhood helpers")
                .assignmentDate(LocalDate.of(2026, 8, 24))
                .submissionDate(LocalDate.of(2026, 8, 26))
                .build();
        assignment.setIsActive(true);
        assignmentRepository.save(assignment);
    }

    private Map<String, Object> toRow(DailyAssignment assignment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", assignment.getId());
        row.put("subject", text(assignment.getSubjectName()));
        row.put("title", text(assignment.getTitle()));
        row.put("assignmentDate", formatDate(assignment.getAssignmentDate()));
        row.put("submissionDate", formatDate(assignment.getSubmissionDate()));
        row.put("evaluationDate", formatDate(assignment.getEvaluationDate()));
        row.put("evaluatedBy", text(assignment.getEvaluatedBy()));
        return row;
    }

    private String resolveClassName(StudentAdmission student) {
        if (student != null && student.getSchoolClass() != null
                && student.getSchoolClass().getName() != null
                && !student.getSchoolClass().getName().isBlank()) {
            return student.getSchoolClass().getName().trim();
        }
        return "Class 1";
    }

    private String resolveSection(StudentAdmission student) {
        if (student != null && student.getSection() != null && !student.getSection().isBlank()) {
            return student.getSection().trim().toUpperCase(Locale.ROOT);
        }
        return "A";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.format(US_DATE);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
