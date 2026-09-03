package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnlineExamService {

    private static final DateTimeFormatter DISPLAY_DATETIME = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");
    private static final DateTimeFormatter INPUT_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final OnlineExamRepository onlineExamRepository;
    private final OnlineExamQuestionRepository onlineExamQuestionRepository;
    private final OnlineExamStudentRepository onlineExamStudentRepository;
    private final OnlineCourseQuestionRepository questionRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;

    @PostConstruct
    public void seedSampleExams() {
        if (onlineExamRepository.count() > 0) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();

        saveSeedExam("General Test", false,
                now.plusDays(14).withHour(16).withMinute(39),
                now.plusDays(14).withHour(18).withMinute(39),
                "01:00:00", 1, 40.0, true, false,
                "General Test");

        saveSeedExam("Online Test - August 2026", false,
                LocalDateTime.of(2026, 8, 24, 16, 39),
                LocalDateTime.of(2026, 8, 24, 18, 39),
                "01:00:00", 1, 40.0, true, false,
                "Online Test - August 2026");

        saveSeedExam("Quiz - May 2026", true,
                LocalDateTime.of(2026, 5, 10, 10, 0),
                LocalDateTime.of(2026, 5, 10, 11, 0),
                "01:00:00", 4, 50.0, true, true,
                "Quiz - May 2026");

        saveSeedExam("Online Test - April 2026", false,
                LocalDateTime.of(2026, 4, 15, 14, 0),
                LocalDateTime.of(2026, 4, 15, 16, 0),
                "01:00:00", 5, 45.0, true, true,
                "Online Test - April 2026");
    }

    private void saveSeedExam(String title, boolean quiz, LocalDateTime from, LocalDateTime to,
                              String duration, int attempt, double passing, boolean publishExam,
                              boolean publishResult, String description) {
        OnlineExam exam = OnlineExam.builder()
                .title(title)
                .quiz(quiz)
                .examFrom(from)
                .examTo(to)
                .timeDuration(duration)
                .attempt(attempt)
                .passingPercentage(passing)
                .answerWordLimit(-1)
                .publishExam(publishExam)
                .publishResult(publishResult)
                .negativeMarking(false)
                .displayMarksInExam(false)
                .randomQuestionOrder(false)
                .description(description)
                .build();
        onlineExamRepository.save(exam);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listExams(String status) {
        LocalDateTime now = LocalDateTime.now();
        List<OnlineExam> exams = "closed".equalsIgnoreCase(status)
                ? onlineExamRepository.findByExamToLessThanOrderByExamToDesc(now)
                : onlineExamRepository.findByExamToGreaterThanEqualOrderByExamFromAsc(now);
        return exams.stream().map(this::toExamRow).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listExamOptions() {
        return onlineExamRepository.findAll().stream()
                .sorted(Comparator.comparing(OnlineExam::getTitle, String.CASE_INSENSITIVE_ORDER))
                .map(exam -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", exam.getId());
                    row.put("title", exam.getTitle());
                    return row;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExam(Long id) {
        return toExamRow(requireExam(id));
    }

    @Transactional
    public Map<String, Object> createExam(Map<String, Object> body) {
        OnlineExam exam = new OnlineExam();
        applyExam(exam, body);
        return toExamRow(onlineExamRepository.save(exam));
    }

    @Transactional
    public Map<String, Object> updateExam(Long id, Map<String, Object> body) {
        OnlineExam exam = requireExam(id);
        applyExam(exam, body);
        return toExamRow(onlineExamRepository.save(exam));
    }

    @Transactional
    public void deleteExam(Long id) {
        if (!onlineExamRepository.existsById(id)) {
            throw new IllegalArgumentException("Exam not found");
        }
        onlineExamStudentRepository.deleteByOnlineExamId(id);
        onlineExamQuestionRepository.findByOnlineExamIdOrderByIdAsc(id)
                .forEach(q -> onlineExamQuestionRepository.deleteById(q.getId()));
        onlineExamRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> bulkDeleteExams(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Select at least one exam");
        }
        int deleted = 0;
        for (Long id : ids) {
            if (id != null && onlineExamRepository.existsById(id)) {
                deleteExam(id);
                deleted++;
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("deleted", deleted);
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudentsForAssign(Long classId, String section, Long examId) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        Set<Long> assigned = onlineExamStudentRepository.findByOnlineExamId(examId).stream()
                .map(OnlineExamStudent::getStudentAdmissionId)
                .collect(Collectors.toSet());

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo() != null ? student.getAdmissionNo() : "");
            row.put("studentName", fullName(student));
            row.put("className", student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
            row.put("section", student.getSection() != null ? student.getSection() : section.trim());
            row.put("classDisplay", (student.getSchoolClass() != null ? student.getSchoolClass().getName() : "")
                    + " (" + (student.getSection() != null ? student.getSection() : section.trim()) + ")");
            row.put("fatherName", student.getFatherName() != null ? student.getFatherName() : "");
            row.put("category", student.getCategory() != null ? student.getCategory().getCategoryName() : "");
            row.put("gender", student.getGender() != null ? student.getGender() : "");
            row.put("assigned", assigned.contains(student.getId()));
            rows.add(row);
        }
        return rows;
    }

    @Transactional
    public void saveAssignedStudents(Long examId, List<Long> studentIds) {
        requireExam(examId);
        onlineExamStudentRepository.deleteByOnlineExamId(examId);
        if (studentIds == null || studentIds.isEmpty()) {
            return;
        }
        for (Long studentId : studentIds) {
            if (studentId == null) {
                continue;
            }
            OnlineExamStudent assign = OnlineExamStudent.builder()
                    .onlineExamId(examId)
                    .studentAdmissionId(studentId)
                    .build();
            onlineExamStudentRepository.save(assign);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchQuestionsForSelect(Map<String, Object> filters) {
        Long tagId = longValue(filters.get("tagId"));
        String type = text(filters.get("questionType"));
        String level = text(filters.get("questionLevel"));
        String keyword = text(filters.get("keyword"));
        Long classId = longValue(filters.get("classId"));
        String section = text(filters.get("section"));

        List<OnlineCourseQuestion> questions = questionRepository.search(tagId, type, level, null, keyword);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCourseQuestion question : questions) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", question.getId());
            row.put("questionText", question.getQuestionText());
            row.put("questionType", question.getQuestionType());
            row.put("level", question.getLevel());
            row.put("marks", 1.0);
            row.put("negativeMarks", 0.25);
            row.put("subject", question.getTag() != null ? question.getTag().getTagName() : "");
            row.put("subjectDisplay", question.getTag() != null
                    ? question.getTag().getTagName() + " (" + question.getTag().getId() + ")"
                    : "");
            row.put("classId", classId);
            row.put("section", section);
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExamQuestions(Long examId, String subjectFilter) {
        requireExam(examId);
        List<OnlineExamQuestion> links = onlineExamQuestionRepository.findByOnlineExamIdOrderByIdAsc(examId);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineExamQuestion link : links) {
            OnlineCourseQuestion question = questionRepository.findById(link.getQuestionId()).orElse(null);
            if (question == null) {
                continue;
            }
            String subject = link.getSubjectName() != null ? link.getSubjectName()
                    : (question.getTag() != null ? question.getTag().getTagName() : "");
            if (subjectFilter != null && !subjectFilter.isBlank() && !"All".equalsIgnoreCase(subjectFilter)
                    && !subject.equalsIgnoreCase(subjectFilter.trim())) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("linkId", link.getId());
            row.put("questionId", question.getId());
            row.put("questionText", question.getQuestionText());
            row.put("questionType", question.getQuestionType());
            row.put("level", question.getLevel());
            row.put("marks", link.getMarks());
            row.put("negativeMarks", link.getNegativeMarks());
            row.put("subject", subject);
            row.put("subjectDisplay", subject + (question.getTag() != null ? " (" + question.getTag().getId() + ")" : ""));
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<String> getExamQuestionSubjects(Long examId) {
        return getExamQuestions(examId, null).stream()
                .map(row -> String.valueOf(row.get("subject")))
                .filter(s -> !s.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @Transactional
    public void addQuestionsToExam(Long examId, List<Map<String, Object>> questions) {
        requireExam(examId);
        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("Select at least one question");
        }
        for (Map<String, Object> item : questions) {
            Long questionId = longValue(item.get("questionId"));
            if (questionId == null) {
                questionId = longValue(item.get("id"));
            }
            if (questionId == null) {
                continue;
            }
            final Long resolvedQuestionId = questionId;
            if (onlineExamQuestionRepository.findByOnlineExamIdAndQuestionId(examId, resolvedQuestionId).isPresent()) {
                continue;
            }
            OnlineCourseQuestion question = questionRepository.findById(resolvedQuestionId)
                    .orElseThrow(() -> new IllegalArgumentException("Question not found: " + resolvedQuestionId));
            double marks = doubleValue(item.get("marks"), 1.0);
            double negativeMarks = doubleValue(item.get("negativeMarks"), 0.25);
            String subject = text(item.get("subject"));
            if (subject.isBlank() && question.getTag() != null) {
                subject = question.getTag().getTagName();
            }
            OnlineExamQuestion link = OnlineExamQuestion.builder()
                    .onlineExamId(examId)
                    .questionId(resolvedQuestionId)
                    .marks(marks)
                    .negativeMarks(negativeMarks)
                    .subjectName(subject)
                    .build();
            onlineExamQuestionRepository.save(link);
        }
    }

    @Transactional
    public void removeQuestionFromExam(Long examId, Long questionId) {
        requireExam(examId);
        onlineExamQuestionRepository.deleteByOnlineExamIdAndQuestionId(examId, questionId);
    }

    private Map<String, Object> toExamRow(OnlineExam exam) {
        long totalQuestions = onlineExamQuestionRepository.countByOnlineExamId(exam.getId());
        long descriptiveCount = onlineExamQuestionRepository.findByOnlineExamIdOrderByIdAsc(exam.getId()).stream()
                .map(link -> questionRepository.findById(link.getQuestionId()).orElse(null))
                .filter(Objects::nonNull)
                .filter(q -> "Descriptive".equalsIgnoreCase(q.getQuestionType()))
                .count();

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", exam.getId());
        row.put("title", exam.getTitle());
        row.put("quiz", Boolean.TRUE.equals(exam.getQuiz()));
        row.put("questionCount", totalQuestions);
        row.put("descriptiveCount", descriptiveCount);
        row.put("questionsDisplay", totalQuestions + " (Descriptive: " + descriptiveCount + ")");
        row.put("attempt", exam.getAttempt());
        row.put("examFrom", formatDateTime(exam.getExamFrom()));
        row.put("examTo", formatDateTime(exam.getExamTo()));
        row.put("examFromInput", toInputDateTime(exam.getExamFrom()));
        row.put("examToInput", toInputDateTime(exam.getExamTo()));
        row.put("autoResultPublishDate", exam.getAutoResultPublishDate() != null
                ? formatDateTime(exam.getAutoResultPublishDate()) : "");
        row.put("autoResultPublishDateInput", exam.getAutoResultPublishDate() != null
                ? toInputDateTime(exam.getAutoResultPublishDate()) : "");
        row.put("timeDuration", exam.getTimeDuration());
        row.put("passingPercentage", exam.getPassingPercentage());
        row.put("answerWordLimit", exam.getAnswerWordLimit());
        row.put("publishExam", Boolean.TRUE.equals(exam.getPublishExam()));
        row.put("publishResult", Boolean.TRUE.equals(exam.getPublishResult()));
        row.put("negativeMarking", Boolean.TRUE.equals(exam.getNegativeMarking()));
        row.put("displayMarksInExam", Boolean.TRUE.equals(exam.getDisplayMarksInExam()));
        row.put("randomQuestionOrder", Boolean.TRUE.equals(exam.getRandomQuestionOrder()));
        row.put("description", exam.getDescription() != null ? exam.getDescription() : "");
        row.put("closed", exam.getExamTo().isBefore(LocalDateTime.now()));
        return row;
    }

    private void applyExam(OnlineExam exam, Map<String, Object> body) {
        String title = text(body.get("title"));
        if (title.isBlank()) {
            throw new IllegalArgumentException("Exam Title is required");
        }
        exam.setTitle(title);
        exam.setQuiz(boolValue(body.get("quiz")));
        exam.setExamFrom(parseDateTime(body.get("examFrom"), "Exam From is required"));
        exam.setExamTo(parseDateTime(body.get("examTo"), "Exam To is required"));
        String autoPublish = text(body.get("autoResultPublishDate"));
        exam.setAutoResultPublishDate(autoPublish.isBlank() ? null : parseDateTime(autoPublish, "Invalid Auto Result Publish Date"));
        exam.setTimeDuration(text(body.get("timeDuration")).isBlank() ? "01:00:00" : text(body.get("timeDuration")));
        exam.setAttempt(intValue(body.get("attempt"), 1));
        exam.setPassingPercentage(doubleValue(body.get("passingPercentage"), 40.0));
        exam.setAnswerWordLimit(intValue(body.get("answerWordLimit"), -1));
        exam.setPublishExam(boolValue(body.get("publishExam")));
        exam.setPublishResult(boolValue(body.get("publishResult")));
        exam.setNegativeMarking(boolValue(body.get("negativeMarking")));
        exam.setDisplayMarksInExam(boolValue(body.get("displayMarksInExam")));
        exam.setRandomQuestionOrder(boolValue(body.get("randomQuestionOrder")));
        exam.setDescription(text(body.get("description")));
    }

    private OnlineExam requireExam(Long id) {
        return onlineExamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private LocalDateTime parseDateTime(Object value, String errorMessage) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }
        String trimmed = String.valueOf(value).trim();
        try {
            if (trimmed.contains("T")) {
                return LocalDateTime.parse(trimmed.length() >= 16 ? trimmed.substring(0, 16) : trimmed, INPUT_DATETIME);
            }
            DateTimeFormatter us = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");
            return LocalDateTime.parse(trimmed, us);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(errorMessage);
        }
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DISPLAY_DATETIME).toLowerCase(Locale.ROOT).replace(" am", " am").replace(" pm", " pm");
    }

    private String toInputDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(INPUT_DATETIME);
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Long longValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.parseLong(String.valueOf(value).trim());
    }

    private int intValue(Object value, int defaultValue) {
        if (value == null || String.valueOf(value).isBlank()) {
            return defaultValue;
        }
        return Integer.parseInt(String.valueOf(value).trim());
    }

    private double doubleValue(Object value, double defaultValue) {
        if (value == null || String.valueOf(value).isBlank()) {
            return defaultValue;
        }
        return Double.parseDouble(String.valueOf(value).trim());
    }

    private boolean boolValue(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean b) {
            return b;
        }
        return "true".equalsIgnoreCase(String.valueOf(value).trim())
                || "1".equals(String.valueOf(value).trim())
                || "on".equalsIgnoreCase(String.valueOf(value).trim());
    }
}
