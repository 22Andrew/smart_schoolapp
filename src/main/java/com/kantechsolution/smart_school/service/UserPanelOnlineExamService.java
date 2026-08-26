package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCourseQuestion;
import com.kantechsolution.smart_school.model.OnlineCourseQuestionTag;
import com.kantechsolution.smart_school.model.OnlineExam;
import com.kantechsolution.smart_school.model.OnlineExamAttempt;
import com.kantechsolution.smart_school.model.OnlineExamQuestion;
import com.kantechsolution.smart_school.model.OnlineExamStudent;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.OnlineCourseQuestionRepository;
import com.kantechsolution.smart_school.repository.OnlineCourseQuestionTagRepository;
import com.kantechsolution.smart_school.repository.OnlineExamAttemptRepository;
import com.kantechsolution.smart_school.repository.OnlineExamQuestionRepository;
import com.kantechsolution.smart_school.repository.OnlineExamRepository;
import com.kantechsolution.smart_school.repository.OnlineExamStudentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UserPanelOnlineExamService {

    public static final long DEMO_VIEW_ID = 405L;

    private static final DateTimeFormatter DISPLAY_DATETIME =
            DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a", Locale.US);
    private static final String GENERAL_TEST = "General Test";
    private static final String SUN_QUESTION = "The sun rises in the east.";

    private final UserPanelContextService contextService;
    private final OnlineExamRepository examRepository;
    private final OnlineExamQuestionRepository examQuestionRepository;
    private final OnlineExamStudentRepository examStudentRepository;
    private final OnlineExamAttemptRepository attemptRepository;
    private final OnlineCourseQuestionRepository questionRepository;
    private final OnlineCourseQuestionTagRepository tagRepository;

    public UserPanelOnlineExamService(UserPanelContextService contextService,
                                      OnlineExamRepository examRepository,
                                      OnlineExamQuestionRepository examQuestionRepository,
                                      OnlineExamStudentRepository examStudentRepository,
                                      OnlineExamAttemptRepository attemptRepository,
                                      OnlineCourseQuestionRepository questionRepository,
                                      OnlineCourseQuestionTagRepository tagRepository) {
        this.contextService = contextService;
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.examStudentRepository = examStudentRepository;
        this.attemptRepository = attemptRepository;
        this.questionRepository = questionRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional
    public Map<String, Object> listExams(Authentication authentication, String tab) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = student != null ? student.getId() : null;
        ensureStudentExams(studentId);
        String normalizedTab = tab == null || tab.isBlank() ? "upcoming" : tab.trim().toLowerCase(Locale.ROOT);
        LocalDateTime now = LocalDateTime.now();

        List<OnlineExam> exams = loadAssignedExams(studentId).stream()
                .filter(exam -> Boolean.TRUE.equals(exam.getPublishExam()))
                .filter(exam -> "closed".equals(normalizedTab)
                        ? exam.getExamTo() != null && exam.getExamTo().isBefore(now)
                        : exam.getExamTo() == null || !exam.getExamTo().isBefore(now))
                .toList();

        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineExam exam : exams) {
            rows.add(toListRow(exam, studentId, now));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tab", normalizedTab);
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> getExam(Authentication authentication, Long examId) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = student != null ? student.getId() : null;
        ensureStudentExams(studentId);
        OnlineExam exam = requireAssignedExam(examId, studentId);
        return toDetail(exam, student, studentId);
    }

    @Transactional
    public Map<String, Object> startExam(Authentication authentication, Long examId) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = student != null && student.getId() != null ? student.getId() : 1L;
        ensureStudentExams(studentId);
        OnlineExam exam = requireAssignedExam(examId, studentId);
        LocalDateTime now = LocalDateTime.now();
        if (exam.getExamFrom() != null && now.isBefore(exam.getExamFrom())) {
            throw new IllegalArgumentException("This exam is not available yet");
        }
        if (exam.getExamTo() != null && now.isAfter(exam.getExamTo())) {
            throw new IllegalArgumentException("This exam is closed");
        }

        long submitted = attemptRepository.countByOnlineExamIdAndStudentAdmissionIdAndSubmittedTrue(examId, studentId);
        int maxAttempts = exam.getAttempt() == null ? 1 : exam.getAttempt();
        OnlineExamAttempt inProgress = attemptRepository
                .findFirstByOnlineExamIdAndStudentAdmissionIdAndSubmittedFalseOrderByAttemptNumberDesc(examId, studentId)
                .orElse(null);

        if (inProgress == null) {
            if (submitted >= maxAttempts) {
                throw new IllegalArgumentException("No attempts remaining");
            }
            inProgress = OnlineExamAttempt.builder()
                    .onlineExamId(examId)
                    .studentAdmissionId(studentId)
                    .attemptNumber((int) submitted + 1)
                    .startedAt(now)
                    .submitted(false)
                    .remainingSeconds(durationSeconds(exam.getTimeDuration()))
                    .answersJson("{}")
                    .build();
            inProgress.setIsActive(true);
            inProgress = attemptRepository.save(inProgress);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("attemptId", inProgress.getId());
        response.put("examId", exam.getId());
        response.put("title", exam.getTitle());
        response.put("remainingSeconds", remainingSeconds(inProgress));
        response.put("answers", readAnswers(inProgress.getAnswersJson()));
        response.put("questions", toStudentQuestions(exam.getId()));
        return response;
    }

    @Transactional
    public Map<String, Object> saveAnswers(Authentication authentication, Long examId, Map<String, Object> body) {
        OnlineExamAttempt attempt = requireOwnedAttempt(authentication, examId, body);
        if (Boolean.TRUE.equals(attempt.getSubmitted())) {
            throw new IllegalArgumentException("This attempt is already submitted");
        }
        if (body.get("answers") instanceof Map<?, ?> answers) {
            attempt.setAnswersJson(writeJson(answers));
        }
        if (body.get("remainingSeconds") != null) {
            attempt.setRemainingSeconds(intValue(body.get("remainingSeconds"), remainingSeconds(attempt)));
        }
        attemptRepository.save(attempt);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        return response;
    }

    @Transactional
    public Map<String, Object> submitExam(Authentication authentication, Long examId, Map<String, Object> body) {
        OnlineExamAttempt attempt = requireOwnedAttempt(authentication, examId, body);
        if (body.get("answers") instanceof Map<?, ?> answers) {
            attempt.setAnswersJson(writeJson(answers));
        }
        attempt.setSubmitted(true);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setRemainingSeconds(0);
        attemptRepository.save(attempt);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "You have submitted your answers to the online exam.");
        return response;
    }

    private OnlineExamAttempt requireOwnedAttempt(Authentication authentication, Long examId, Map<String, Object> body) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = student != null && student.getId() != null ? student.getId() : 1L;
        Long attemptId = longValue(body == null ? null : body.get("attemptId"));
        OnlineExamAttempt attempt = attemptId == null
                ? attemptRepository.findFirstByOnlineExamIdAndStudentAdmissionIdAndSubmittedFalseOrderByAttemptNumberDesc(
                        examId, studentId).orElse(null)
                : attemptRepository.findById(attemptId).orElse(null);
        if (attempt == null || !examId.equals(attempt.getOnlineExamId())
                || !studentId.equals(attempt.getStudentAdmissionId())) {
            throw new IllegalArgumentException("Exam attempt not found");
        }
        return attempt;
    }

    private void ensureStudentExams(Long studentId) {
        if (!loadAssignedExams(studentId).isEmpty()) {
            return;
        }
        ensureDemoExam(studentId);
    }

    private List<OnlineExam> loadAssignedExams(Long studentId) {
        if (studentId == null) {
            return examRepository.findAll().stream()
                    .filter(exam -> Boolean.TRUE.equals(exam.getPublishExam()))
                    .toList();
        }
        List<OnlineExam> exams = new ArrayList<>();
        for (OnlineExamStudent assignment : examStudentRepository.findByStudentAdmissionId(studentId)) {
            examRepository.findById(assignment.getOnlineExamId()).ifPresent(exams::add);
        }
        return exams;
    }

    private OnlineExam requireAssignedExam(Long examId, Long studentId) {
        OnlineExam exam = requireExam(examId);
        if (studentId != null
                && !examStudentRepository.existsByOnlineExamIdAndStudentAdmissionId(examId, studentId)) {
            throw new IllegalArgumentException("Exam not found");
        }
        return exam;
    }

    private OnlineExam ensureDemoExam(Long studentId) {
        OnlineExam exam = examRepository.findFirstByTitleIgnoreCase(GENERAL_TEST).orElse(null);
        if (exam == null) {
            exam = OnlineExam.builder()
                    .title(GENERAL_TEST)
                    .quiz(true)
                    .examFrom(LocalDateTime.of(2026, 8, 24, 16, 39))
                    .examTo(LocalDateTime.of(2026, 8, 29, 16, 39))
                    .timeDuration("01:00:00")
                    .attempt(5)
                    .passingPercentage(33.0)
                    .answerWordLimit(300)
                    .publishExam(true)
                    .publishResult(false)
                    .negativeMarking(false)
                    .displayMarksInExam(false)
                    .randomQuestionOrder(false)
                    .description(GENERAL_TEST)
                    .build();
            exam.setIsActive(true);
            exam = examRepository.save(exam);
        }

        seedQuestions(exam.getId());
        if (studentId != null
                && !examStudentRepository.existsByOnlineExamIdAndStudentAdmissionId(exam.getId(), studentId)) {
            OnlineExamStudent assign = OnlineExamStudent.builder()
                    .onlineExamId(exam.getId())
                    .studentAdmissionId(studentId)
                    .build();
            assign.setIsActive(true);
            examStudentRepository.save(assign);
        }
        return exam;
    }

    private void seedQuestions(Long examId) {
        if (examQuestionRepository.countByOnlineExamId(examId) >= 18) {
            return;
        }
        OnlineCourseQuestionTag tag = resolveTag("General Knowledge");
        List<QuestionSeed> seeds = demoQuestions();
        for (QuestionSeed seed : seeds) {
            OnlineCourseQuestion question = questionRepository.findFirstByQuestionTextIgnoreCase(seed.text())
                    .orElseGet(() -> {
                        OnlineCourseQuestion created = new OnlineCourseQuestion();
                        created.setTag(tag);
                        created.setQuestionType(seed.type());
                        created.setLevel("Low");
                        created.setQuestionText(seed.text());
                        created.setOptionsJson(seed.optionsJson());
                        created.setCorrectAnswer(seed.correct());
                        created.setCreatedBy("Joe Black (9000)");
                        return questionRepository.save(created);
                    });
            if (examQuestionRepository.findByOnlineExamIdAndQuestionId(examId, question.getId()).isEmpty()) {
                OnlineExamQuestion link = OnlineExamQuestion.builder()
                        .onlineExamId(examId)
                        .questionId(question.getId())
                        .marks(1.0)
                        .negativeMarks(0.0)
                        .subjectName(tag.getTagName())
                        .build();
                link.setIsActive(true);
                examQuestionRepository.save(link);
            }
        }
    }

    private List<QuestionSeed> demoQuestions() {
        return List.of(
                tf(SUN_QUESTION, "True"),
                tf("Water boils at 100 degrees Celsius.", "True"),
                tf("The capital of India is Mumbai.", "False"),
                tf("A square has four equal sides.", "True"),
                tf("The moon produces its own light.", "False"),
                choice("Which planet is known as the Red Planet?", "Mars", "Venus", "Jupiter", "Saturn"),
                choice("How many days are there in a leap year?", "366", "365", "364", "360"),
                choice("Which gas do plants absorb from the air?", "Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"),
                choice("What is the largest ocean on Earth?", "Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"),
                choice("Which is the fastest land animal?", "Cheetah", "Lion", "Horse", "Tiger"),
                descriptive("Write three uses of water in daily life."),
                descriptive("Describe your favourite season and why you like it."),
                descriptive("Explain why we should plant more trees."),
                descriptive("Write a short paragraph about your school."),
                descriptive("List four good habits you follow at home."),
                descriptive("Describe a festival you celebrate with your family."),
                descriptive("Write about a person who inspires you."),
                descriptive("Explain how you keep yourself healthy.")
        );
    }

    private QuestionSeed tf(String text, String correct) {
        return new QuestionSeed(text, "True/False",
                "[{\"text\":\"True\",\"correct\":" + "True".equalsIgnoreCase(correct)
                        + "},{\"text\":\"False\",\"correct\":" + "False".equalsIgnoreCase(correct) + "}]",
                correct);
    }

    private QuestionSeed choice(String text, String a, String b, String c, String d) {
        return new QuestionSeed(text, "Single Choice",
                "[{\"text\":\"" + a + "\",\"correct\":true},{\"text\":\"" + b + "\",\"correct\":false},"
                        + "{\"text\":\"" + c + "\",\"correct\":false},{\"text\":\"" + d + "\",\"correct\":false}]",
                a);
    }

    private QuestionSeed descriptive(String text) {
        return new QuestionSeed(text, "Descriptive", null, null);
    }

    private OnlineCourseQuestionTag resolveTag(String name) {
        return tagRepository.findByTagNameIgnoreCase(name).orElseGet(() -> {
            OnlineCourseQuestionTag tag = new OnlineCourseQuestionTag();
            tag.setTagName(name);
            return tagRepository.save(tag);
        });
    }

    private Map<String, Object> toListRow(OnlineExam exam, Long studentId, LocalDateTime now) {
        long attempted = studentId == null ? 0
                : attemptRepository.countByOnlineExamIdAndStudentAdmissionIdAndSubmittedTrue(exam.getId(), studentId);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", exam.getId());
        row.put("title", exam.getTitle());
        row.put("quiz", Boolean.TRUE.equals(exam.getQuiz()));
        row.put("examFrom", formatDateTime(exam.getExamFrom()));
        row.put("examTo", formatDateTime(exam.getExamTo()));
        row.put("duration", exam.getTimeDuration());
        row.put("totalAttempt", exam.getAttempt());
        row.put("attempted", attempted);
        row.put("status", resolveStatus(exam, now));
        return row;
    }

    private Map<String, Object> toDetail(OnlineExam exam, StudentAdmission student, Long studentId) {
        LocalDateTime now = LocalDateTime.now();
        long totalQuestions = examQuestionRepository.countByOnlineExamId(exam.getId());
        long descriptiveCount = examQuestionRepository.findByOnlineExamIdOrderByIdAsc(exam.getId()).stream()
                .map(link -> questionRepository.findById(link.getQuestionId()).orElse(null))
                .filter(q -> q != null && "Descriptive".equalsIgnoreCase(q.getQuestionType()))
                .count();
        long attempted = studentId == null ? 0
                : attemptRepository.countByOnlineExamIdAndStudentAdmissionIdAndSubmittedTrue(exam.getId(), studentId);

        Map<String, Object> row = toListRow(exam, studentId, now);
        row.put("studentName", contextService.resolveStudentName(student));
        row.put("admissionNo", contextService.resolveAdmissionNo(student));
        row.put("classLabel", contextService.resolveClassLabel(student));
        row.put("fatherName", student != null && student.getFatherName() != null && !student.getFatherName().isBlank()
                ? student.getFatherName().trim()
                : "");
        row.put("totalQuestions", totalQuestions);
        row.put("descriptiveQuestions", descriptiveCount);
        row.put("answerWordLimit", exam.getAnswerWordLimit() == null || exam.getAnswerWordLimit() < 0
                ? ""
                : exam.getAnswerWordLimit());
        row.put("passingPercentage", exam.getPassingPercentage() == null ? "" : exam.getPassingPercentage().intValue());
        row.put("description", exam.getDescription() == null ? "" : exam.getDescription());
        row.put("canStart", "Available".equals(row.get("status")) && attempted < (exam.getAttempt() == null ? 1 : exam.getAttempt()));
        return row;
    }

    private List<Map<String, Object>> toStudentQuestions(Long examId) {
        OnlineExam exam = requireExam(examId);
        List<OnlineExamQuestion> links = examQuestionRepository.findByOnlineExamIdOrderByIdAsc(examId);
        List<Map<String, Object>> questions = new ArrayList<>();
        int number = 1;
        for (OnlineExamQuestion link : links) {
            OnlineCourseQuestion question = questionRepository.findById(link.getQuestionId()).orElse(null);
            if (question == null) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", question.getId());
            row.put("number", number++);
            row.put("text", question.getQuestionText());
            row.put("type", question.getQuestionType());
            row.put("wordLimit", "Descriptive".equalsIgnoreCase(question.getQuestionType())
                    ? exam.getAnswerWordLimit()
                    : null);
            row.put("options", studentOptions(question));
            questions.add(row);
        }
        return questions;
    }

    private List<Map<String, Object>> studentOptions(OnlineCourseQuestion question) {
        List<Map<String, Object>> options = new ArrayList<>();
        if ("Descriptive".equalsIgnoreCase(question.getQuestionType())) {
            return options;
        }
        List<Map<String, Object>> parsed = readOptionList(question.getOptionsJson());
        if (parsed.isEmpty() && "True/False".equalsIgnoreCase(question.getQuestionType())) {
            options.add(option("True"));
            options.add(option("False"));
            return options;
        }
        for (Map<String, Object> item : parsed) {
            Object text = item.get("text");
            if (text != null && !String.valueOf(text).isBlank()) {
                options.add(option(String.valueOf(text)));
            }
        }
        return options;
    }

    private Map<String, Object> option(String text) {
        Map<String, Object> option = new LinkedHashMap<>();
        option.put("text", text);
        return option;
    }

    private String resolveStatus(OnlineExam exam, LocalDateTime now) {
        if (exam.getExamTo() != null && now.isAfter(exam.getExamTo())) {
            return "Closed";
        }
        if (exam.getExamFrom() != null && now.isBefore(exam.getExamFrom())) {
            return "Upcoming";
        }
        return "Available";
    }

    private int remainingSeconds(OnlineExamAttempt attempt) {
        if (attempt.getRemainingSeconds() != null) {
            return Math.max(0, attempt.getRemainingSeconds());
        }
        return 3600;
    }

    private int durationSeconds(String duration) {
        if (duration == null || duration.isBlank()) {
            return 3600;
        }
        String[] parts = duration.trim().split(":");
        try {
            if (parts.length == 3) {
                return Integer.parseInt(parts[0]) * 3600
                        + Integer.parseInt(parts[1]) * 60
                        + Integer.parseInt(parts[2]);
            }
            if (parts.length == 2) {
                return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
            }
        } catch (NumberFormatException ignored) {
            return 3600;
        }
        return 3600;
    }

    private OnlineExam requireExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    private Map<String, Object> readAnswers(String json) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (json == null || json.isBlank()) {
            return map;
        }
        Matcher matcher = Pattern.compile("\"([^\"]+)\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"").matcher(json);
        while (matcher.find()) {
            map.put(matcher.group(1), matcher.group(2).replace("\\\"", "\""));
        }
        return map;
    }

    private List<Map<String, Object>> readOptionList(String json) {
        List<Map<String, Object>> options = new ArrayList<>();
        if (json == null || json.isBlank()) {
            return options;
        }
        Matcher matcher = Pattern.compile("\"text\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"").matcher(json);
        while (matcher.find()) {
            options.add(option(matcher.group(1).replace("\\\"", "\"")));
        }
        return options;
    }

    private String writeJson(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return "{}";
        }
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!first) {
                json.append(',');
            }
            first = false;
            json.append('"').append(escapeJson(String.valueOf(entry.getKey()))).append('"')
                    .append(':')
                    .append('"').append(escapeJson(entry.getValue() == null ? "" : String.valueOf(entry.getValue()))).append('"');
        }
        json.append('}');
        return json.toString();
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DISPLAY_DATETIME).replace("AM", "am").replace("PM", "pm");
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

    private record QuestionSeed(String text, String type, String optionsJson, String correct) {
    }
}
