package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.model.HomeworkStudentEvaluation;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.HomeworkRepository;
import com.kantechsolution.smart_school.repository.HomeworkStudentEvaluationRepository;
import org.springframework.security.core.Authentication;
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
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class UserPanelHomeworkService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final UserPanelContextService contextService;
    private final HomeworkService homeworkService;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkStudentEvaluationRepository evaluationRepository;
    private final UploadStorage uploadStorage;

    public UserPanelHomeworkService(UserPanelContextService contextService,
                                    HomeworkService homeworkService,
                                    HomeworkRepository homeworkRepository,
                                    HomeworkStudentEvaluationRepository evaluationRepository,
                                    UploadStorage uploadStorage) {
        this.contextService = contextService;
        this.homeworkService = homeworkService;
        this.homeworkRepository = homeworkRepository;
        this.evaluationRepository = evaluationRepository;
        this.uploadStorage = uploadStorage;
    }

    @Transactional
    public Map<String, Object> listHomework(Authentication authentication, String tab) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String className = resolveClassName(student);
        String section = resolveSection(student);
        Long classId = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getId()
                : null;
        ensureDemoHomework(className, section, classId);

        String normalizedTab = tab == null || tab.isBlank() ? "upcoming" : tab.trim().toLowerCase(Locale.ROOT);
        List<Homework> items = homeworkService.searchHomework(classId, section, null, null, normalizedTab);
        if (items.isEmpty() && classId != null) {
            items = homeworkService.searchHomework(null, section, null, null, normalizedTab).stream()
                    .filter(item -> className.equalsIgnoreCase(item.getClassName()))
                    .toList();
        }

        Long studentId = student != null ? student.getId() : null;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Homework homework : items) {
            if (!matchesStudentClass(homework, className, section, classId)) {
                continue;
            }
            rows.add(toRow(homework, studentId));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tab", normalizedTab);
        response.put("rows", rows);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getHomework(Authentication authentication, Long homeworkId) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Homework homework = requireOwnedHomework(homeworkId, student);
        return toDetail(homework, student);
    }

    @Transactional
    public Map<String, Object> submitHomework(Authentication authentication, Long homeworkId,
                                              String message, MultipartFile document) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Homework homework = requireOwnedHomework(homeworkId, student);
        String trimmed = message == null ? "" : message.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Message is required");
        }

        Long studentId = student != null && student.getId() != null ? student.getId() : 1L;
        String studentName = contextService.resolveStudentName(student);

        HomeworkStudentEvaluation evaluation = evaluationRepository
                .findByHomeworkIdAndStudentAdmissionIdAndIsActiveTrue(homeworkId, studentId)
                .orElseGet(HomeworkStudentEvaluation::new);
        evaluation.setHomeworkId(homeworkId);
        evaluation.setStudentAdmissionId(studentId);
        evaluation.setStudentName(studentName);
        evaluation.setMessage(trimmed);
        evaluation.setIsActive(true);

        if (document != null && !document.isEmpty()) {
            StoredFile stored = storeDocument(document);
            evaluation.setDocumentPath(stored.path());
            evaluation.setDocumentName(stored.name());
        }

        evaluationRepository.save(evaluation);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Homework saved successfully!");
        response.put("data", toDetail(homework, student));
        return response;
    }

    private void ensureDemoHomework(String className, String section, Long classId) {
        if (homeworkRepository.existsByClassNameIgnoreCaseAndSectionIgnoreCaseAndIsActiveTrue(className, section)) {
            return;
        }
        Homework homework = Homework.builder()
                .classId(classId)
                .className(className)
                .section(section)
                .subjectGroupName("Class 1 subject")
                .subjectName("Social Studies (212)")
                .homeworkDate(LocalDate.of(2026, 8, 24))
                .submissionDate(LocalDate.of(2026, 8, 31))
                .maxMarks(25)
                .description("all")
                .createdBy("")
                .build();
        homework.setIsActive(true);
        homeworkRepository.save(homework);
    }

    private Homework requireOwnedHomework(Long homeworkId, StudentAdmission student) {
        Homework homework = homeworkService.getHomeworkById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
        String className = resolveClassName(student);
        String section = resolveSection(student);
        Long classId = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getId()
                : null;
        if (!matchesStudentClass(homework, className, section, classId)) {
            throw new IllegalArgumentException("Homework not found");
        }
        return homework;
    }

    private boolean matchesStudentClass(Homework homework, String className, String section, Long classId) {
        boolean classMatches = (classId != null && classId.equals(homework.getClassId()))
                || className.equalsIgnoreCase(homework.getClassName());
        return classMatches && section.equalsIgnoreCase(homework.getSection());
    }

    private Map<String, Object> toRow(Homework homework, Long studentId) {
        HomeworkStudentEvaluation evaluation = studentId == null ? null
                : evaluationRepository.findByHomeworkIdAndStudentAdmissionIdAndIsActiveTrue(homework.getId(), studentId)
                .orElse(null);
        Map<String, Object> row = toSummary(homework, evaluation);
        row.put("note", "");
        return row;
    }

    private Map<String, Object> toDetail(Homework homework, StudentAdmission student) {
        Long studentId = student != null ? student.getId() : null;
        HomeworkStudentEvaluation evaluation = studentId == null ? null
                : evaluationRepository.findByHomeworkIdAndStudentAdmissionIdAndIsActiveTrue(homework.getId(), studentId)
                .orElse(null);
        Map<String, Object> detail = toSummary(homework, evaluation);
        detail.put("description", text(homework.getDescription()));
        detail.put("message", evaluation != null ? text(evaluation.getMessage()) : "");
        detail.put("documentName", evaluation != null ? text(evaluation.getDocumentName()) : "");
        detail.put("documentPath", evaluation != null ? text(evaluation.getDocumentPath()) : "");
        return detail;
    }

    private Map<String, Object> toSummary(Homework homework, HomeworkStudentEvaluation evaluation) {
        boolean submitted = evaluation != null
                && ((evaluation.getMessage() != null && !evaluation.getMessage().isBlank())
                || (evaluation.getDocumentPath() != null && !evaluation.getDocumentPath().isBlank()));
        boolean evaluated = evaluation != null && evaluation.getMarks() != null;
        String status = evaluated ? "Evaluated" : (submitted ? "Submitted" : "Pending");

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", homework.getId());
        row.put("className", text(homework.getClassName()));
        row.put("section", text(homework.getSection()));
        row.put("subject", text(homework.getSubjectName()));
        row.put("homeworkDate", formatDate(homework.getHomeworkDate()));
        row.put("submissionDate", formatDate(homework.getSubmissionDate()));
        row.put("evaluationDate", formatDate(homework.getEvaluationDate()));
        row.put("maxMarks", formatMarks(homework.getMaxMarks()));
        row.put("marksObtained", evaluation != null ? formatMarks(evaluation.getMarks()) : "");
        row.put("createdBy", text(homework.getCreatedBy()));
        row.put("evaluatedBy", text(homework.getEvaluatedBy()));
        row.put("status", status);
        return row;
    }

    private StoredFile storeDocument(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT)
                : ".pdf";
        try {
            Path uploadDir = uploadStorage.getHomeworkDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return new StoredFile("/uploads/homework/" + filename, originalName);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store document: " + e.getMessage());
        }
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

    private String formatMarks(Number marks) {
        if (marks == null) {
            return "";
        }
        return String.format(Locale.US, "%.2f", marks.doubleValue());
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private record StoredFile(String path, String name) {
    }
}
