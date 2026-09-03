package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.Homework;
import com.kantechsolution.smart_school.model.HomeworkStudentEvaluation;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.HomeworkRepository;
import com.kantechsolution.smart_school.repository.HomeworkStudentEvaluationRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final HomeworkStudentEvaluationRepository homeworkStudentEvaluationRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final UploadStorage uploadStorage;

    public List<Homework> getAllHomework() {
        return homeworkRepository.findByIsActiveTrueOrderByHomeworkDateDescCreatedAtDesc();
    }

    public List<Homework> searchHomework(Long classId, String section, Long subjectGroupId,
                                         Long subjectId, String tab) {
        String normalizedTab = tab == null || tab.isBlank() ? "upcoming" : tab.trim().toLowerCase(Locale.ROOT);
        if (!Set.of("upcoming", "closed", "all").contains(normalizedTab)) {
            normalizedTab = "upcoming";
        }
        return homeworkRepository.searchHomework(
                classId,
                section,
                subjectGroupId,
                subjectId,
                normalizedTab,
                LocalDate.now()
        );
    }

    public Optional<Homework> getHomeworkById(Long id) {
        return homeworkRepository.findById(id)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()));
    }

    @Transactional
    public Homework createHomework(Map<String, Object> payload, MultipartFile document) {
        Homework homework = buildFromPayload(new Homework(), payload);
        if (document != null && !document.isEmpty()) {
            StoredFile stored = storeDocument(document);
            homework.setDocumentPath(stored.path());
            homework.setDocumentName(stored.name());
        }
        if (homework.getCreatedBy() == null || homework.getCreatedBy().isBlank()) {
            homework.setCreatedBy("Joe Black (9000)");
        }
        return homeworkRepository.save(homework);
    }

    @Transactional
    public Homework updateHomework(Long id, Map<String, Object> payload, MultipartFile document) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
        buildFromPayload(homework, payload);
        if (document != null && !document.isEmpty()) {
            StoredFile stored = storeDocument(document);
            homework.setDocumentPath(stored.path());
            homework.setDocumentName(stored.name());
        }
        return homeworkRepository.save(homework);
    }

    @Transactional
    public void deleteHomework(Long id) {
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
        homework.setIsActive(false);
        homeworkRepository.save(homework);
    }

    public Map<String, Object> getEvaluationView(Long homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));

        List<StudentAdmission> students = studentAdmissionRepository.search(
                homework.getClassId(),
                homework.getSection(),
                null,
                false,
                null
        );

        List<HomeworkStudentEvaluation> existing = homeworkStudentEvaluationRepository
                .findByHomeworkIdAndIsActiveTrueOrderByStudentNameAsc(homeworkId);

        Map<Long, HomeworkStudentEvaluation> byStudentId = new HashMap<>();
        for (HomeworkStudentEvaluation evaluation : existing) {
            byStudentId.put(evaluation.getStudentAdmissionId(), evaluation);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            HomeworkStudentEvaluation evaluation = byStudentId.get(student.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentAdmissionId", student.getId());
            row.put("studentName", fullStudentName(student));
            row.put("message", evaluation != null ? evaluation.getMessage() : "");
            row.put("documentPath", evaluation != null ? evaluation.getDocumentPath() : "");
            row.put("documentName", evaluation != null ? evaluation.getDocumentName() : "");
            row.put("marks", evaluation != null ? evaluation.getMarks() : null);
            rows.add(row);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("homework", homeworkToEvaluationSummary(homework));
        response.put("students", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> saveEvaluation(Long homeworkId, Map<String, Object> payload) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));

        LocalDate evaluationDate = parseDate(payload.get("evaluationDate"), "Evaluation date is required");
        String evaluatedBy = text(payload.get("evaluatedBy"));
        if (evaluatedBy == null || evaluatedBy.isBlank()) {
            evaluatedBy = "Joe Black (9000)";
        }

        homework.setEvaluationDate(evaluationDate);
        homework.setEvaluatedBy(evaluatedBy);
        homeworkRepository.save(homework);

        Object entriesObj = payload.get("entries");
        if (entriesObj instanceof List<?> entries) {
            for (Object entryObj : entries) {
                if (!(entryObj instanceof Map<?, ?> entryMap)) {
                    continue;
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> entry = (Map<String, Object>) entryMap;
                Long studentId = longValue(entry.get("studentAdmissionId"));
                if (studentId == null) {
                    continue;
                }

                HomeworkStudentEvaluation evaluation = homeworkStudentEvaluationRepository
                        .findByHomeworkIdAndStudentAdmissionIdAndIsActiveTrue(homeworkId, studentId)
                        .orElseGet(HomeworkStudentEvaluation::new);

                evaluation.setHomeworkId(homeworkId);
                evaluation.setStudentAdmissionId(studentId);
                evaluation.setStudentName(requiredText(entry.get("studentName"), "Student name is required"));
                evaluation.setMessage(text(entry.get("message")));
                evaluation.setDocumentPath(text(entry.get("documentPath")));
                evaluation.setDocumentName(text(entry.get("documentName")));
                evaluation.setMarks(doubleValue(entry.get("marks")));
                evaluation.setIsActive(true);
                homeworkStudentEvaluationRepository.save(evaluation);
            }
        }

        return getEvaluationView(homeworkId);
    }

    private Map<String, Object> homeworkToEvaluationSummary(Homework homework) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", homework.getId());
        summary.put("homeworkDate", homework.getHomeworkDate());
        summary.put("submissionDate", homework.getSubmissionDate());
        summary.put("evaluationDate", homework.getEvaluationDate());
        summary.put("createdBy", homework.getCreatedBy());
        summary.put("evaluatedBy", homework.getEvaluatedBy());
        summary.put("className", homework.getClassName());
        summary.put("section", homework.getSection());
        summary.put("subjectGroupName", homework.getSubjectGroupName());
        summary.put("subjectName", homework.getSubjectName());
        summary.put("maxMarks", homework.getMaxMarks());
        summary.put("description", homework.getDescription());
        return summary;
    }

    private String fullStudentName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private Double doubleValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Double.valueOf(String.valueOf(value).trim());
    }

    private Homework buildFromPayload(Homework homework, Map<String, Object> payload) {
        homework.setClassId(longValue(payload.get("classId")));
        homework.setClassName(requiredText(payload.get("className"), "Class is required"));
        homework.setSection(requiredText(payload.get("section"), "Section is required"));
        homework.setSubjectGroupId(longValue(payload.get("subjectGroupId")));
        homework.setSubjectGroupName(requiredText(payload.get("subjectGroupName"), "Subject group is required"));
        homework.setSubjectId(longValue(payload.get("subjectId")));
        homework.setSubjectName(requiredText(payload.get("subjectName"), "Subject is required"));
        homework.setHomeworkDate(parseDate(payload.get("homeworkDate"), "Homework date is required"));
        homework.setSubmissionDate(parseDate(payload.get("submissionDate"), "Submission date is required"));
        homework.setEvaluationDate(parseOptionalDate(payload.get("evaluationDate")));
        homework.setMaxMarks(intValue(payload.get("maxMarks")));
        homework.setDescription(text(payload.get("description")));
        if (payload.get("createdBy") != null && !String.valueOf(payload.get("createdBy")).isBlank()) {
            homework.setCreatedBy(String.valueOf(payload.get("createdBy")).trim());
        }
        homework.setIsActive(true);
        return homework;
    }

    private StoredFile storeDocument(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        if (extension.isBlank()) {
            extension = ".pdf";
        }

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

    private String requiredText(Object value, String message) {
        String text = text(value);
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return text.trim();
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

    private Integer intValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Integer.valueOf(String.valueOf(value).trim());
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

    private record StoredFile(String path, String name) {}
}
