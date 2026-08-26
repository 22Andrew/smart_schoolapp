package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.LessonPlanLesson;
import com.kantechsolution.smart_school.model.LessonPlanSyllabusStatus;
import com.kantechsolution.smart_school.model.LessonPlanTopic;
import com.kantechsolution.smart_school.model.SchoolClass;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.Subject;
import com.kantechsolution.smart_school.model.SubjectGroup;
import com.kantechsolution.smart_school.repository.LessonPlanLessonRepository;
import com.kantechsolution.smart_school.repository.LessonPlanSyllabusStatusRepository;
import com.kantechsolution.smart_school.repository.LessonPlanTopicRepository;
import com.kantechsolution.smart_school.repository.SchoolClassRepository;
import com.kantechsolution.smart_school.repository.SubjectGroupRepository;
import com.kantechsolution.smart_school.repository.SubjectRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelSyllabusStatusService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final List<String> SUBJECT_ORDER = List.of(
            "English", "Hindi", "Mathematics", "Science", "Social Studies"
    );

    private final UserPanelContextService contextService;
    private final LessonPlanLessonRepository lessonRepository;
    private final LessonPlanTopicRepository topicRepository;
    private final LessonPlanSyllabusStatusRepository statusRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SchoolClassRepository schoolClassRepository;

    public UserPanelSyllabusStatusService(UserPanelContextService contextService,
                                          LessonPlanLessonRepository lessonRepository,
                                          LessonPlanTopicRepository topicRepository,
                                          LessonPlanSyllabusStatusRepository statusRepository,
                                          SubjectRepository subjectRepository,
                                          SubjectGroupRepository subjectGroupRepository,
                                          SchoolClassRepository schoolClassRepository) {
        this.contextService = contextService;
        this.lessonRepository = lessonRepository;
        this.topicRepository = topicRepository;
        this.statusRepository = statusRepository;
        this.subjectRepository = subjectRepository;
        this.subjectGroupRepository = subjectGroupRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @Transactional
    public Map<String, Object> getStatus(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        String className = resolveClassName(student);
        String section = resolveSection(student);
        Long classId = student != null && student.getSchoolClass() != null
                ? student.getSchoolClass().getId()
                : null;

        ensureOverviewData(className, section, classId);
        List<LessonPlanLesson> lessons = loadLessons(className, section, classId);
        List<Map<String, Object>> subjects = buildSubjects(lessons);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subjects", subjects);
        return response;
    }

    private List<Map<String, Object>> buildSubjects(List<LessonPlanLesson> lessons) {
        Map<String, List<LessonPlanLesson>> grouped = new LinkedHashMap<>();
        for (String name : SUBJECT_ORDER) {
            grouped.put(name.toLowerCase(Locale.ROOT), new ArrayList<>());
        }
        for (LessonPlanLesson lesson : lessons) {
            String key = text(lesson.getSubjectName()).toLowerCase(Locale.ROOT);
            grouped.computeIfAbsent(key, ignored -> new ArrayList<>()).add(lesson);
        }

        List<Map<String, Object>> subjects = new ArrayList<>();
        for (Map.Entry<String, List<LessonPlanLesson>> entry : grouped.entrySet()) {
            List<LessonPlanLesson> subjectLessons = entry.getValue();
            if (subjectLessons.isEmpty()) {
                continue;
            }
            subjectLessons.sort(Comparator.comparing(LessonPlanLesson::getId, Comparator.nullsLast(Long::compareTo)));
            subjects.add(toSubjectMap(subjectLessons));
        }
        return subjects;
    }

    private Map<String, Object> toSubjectMap(List<LessonPlanLesson> subjectLessons) {
        LessonPlanLesson first = subjectLessons.get(0);
        List<Map<String, Object>> lessonMaps = new ArrayList<>();
        int completedTopics = 0;
        int totalTopics = 0;
        int lessonIndex = 1;

        for (LessonPlanLesson lesson : subjectLessons) {
            List<LessonPlanTopic> topics = lesson.getTopics() == null ? List.of() : lesson.getTopics();
            List<Map<String, Object>> topicMaps = new ArrayList<>();
            int lessonCompleted = 0;
            int topicIndex = 1;
            for (LessonPlanTopic topic : topics) {
                LessonPlanSyllabusStatus status = statusRepository.findByTopicId(topic.getId())
                        .orElse(null);
                boolean completed = status != null && Boolean.TRUE.equals(status.getCompleted());
                if (completed) {
                    lessonCompleted++;
                    completedTopics++;
                }
                totalTopics++;
                topicMaps.add(toTopicMap(lessonIndex, topicIndex++, topic, status, completed));
            }
            Map<String, Object> lessonMap = new LinkedHashMap<>();
            lessonMap.put("index", lessonIndex);
            lessonMap.put("name", text(lesson.getLessonName()));
            lessonMap.put("label", lessonIndex + " " + text(lesson.getLessonName()));
            lessonMap.put("percent", percent(lessonCompleted, topics.size()));
            lessonMap.put("topics", topicMaps);
            lessonMaps.add(lessonMap);
            lessonIndex++;
        }

        Map<String, Object> subject = new LinkedHashMap<>();
        subject.put("subjectName", text(first.getSubjectName()));
        subject.put("subjectCode", text(first.getSubjectCode()));
        subject.put("subjectLabel", formatSubjectLabel(first.getSubjectName(), first.getSubjectCode()));
        subject.put("percent", percent(completedTopics, totalTopics));
        subject.put("completedTopics", completedTopics);
        subject.put("totalTopics", totalTopics);
        subject.put("lessons", lessonMaps);
        return subject;
    }

    private Map<String, Object> toTopicMap(int lessonIndex, int topicIndex, LessonPlanTopic topic,
                                           LessonPlanSyllabusStatus status, boolean completed) {
        String rawName = text(topic.getTopicName());
        String label = numberedTopicName(rawName)
                ? rawName
                : lessonIndex + "." + topicIndex + " " + rawName;
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("name", rawName);
        row.put("label", label);
        row.put("completed", completed);
        row.put("completionDate", status != null && status.getCompletionDate() != null
                ? status.getCompletionDate().format(US_DATE) : "");
        if (completed) {
            String date = row.get("completionDate").toString();
            row.put("statusLabel", date.isBlank() ? "Complete" : "Complete (" + date + ")");
        } else {
            row.put("statusLabel", "Incomplete");
        }
        return row;
    }

    private void ensureOverviewData(String className, String section, Long classId) {
        SchoolClass schoolClass = resolveSchoolClass(className, classId);
        if (schoolClass == null) {
            return;
        }
        Long resolvedClassId = schoolClass.getId();
        SubjectGroup group = resolveSubjectGroup(schoolClass, section);
        List<LessonPlanLesson> lessons = loadLessons(className, section, resolvedClassId);

        ensureSubjectLessons(lessons, schoolClass, section, group, "English", "210",
                List.of(
                        new DemoLesson("Chapter 1", List.of(new DemoTopic("1.1 Noun", LocalDate.of(2026, 4, 1))), true),
                        new DemoLesson("First Day at School", List.of(new DemoTopic("2.1 School Life", LocalDate.of(2026, 4, 3))), true),
                        new DemoLesson("The Wind and the Sun", List.of(new DemoTopic("3.1 The Wind", LocalDate.of(2026, 4, 14))), true),
                        new DemoLesson("Storm in the Garden", List.of(new DemoTopic("4.1 My Garden", LocalDate.of(2026, 4, 17))), true),
                        new DemoLesson("The Grasshopper and the Ant", List.of(new DemoTopic("5.1 The Ant", LocalDate.of(2026, 4, 30))), true),
                        new DemoLesson("A Happy Child", List.of(new DemoTopic("6.1 Happiness", null)), false),
                        new DemoLesson("After a Bath", List.of(new DemoTopic("7.1 Cleanliness", null)), false)
                ));
        ensureEnglishIncompleteLessons(lessons, schoolClass, section, group);
        ensureSubjectLessons(lessons, schoolClass, section, group, "Hindi", "230",
                List.of(
                        new DemoLesson("Varnamala", List.of(new DemoTopic("Swar", null)), false),
                        new DemoLesson("Barahkhadi", List.of(new DemoTopic("Ka Kha Ga", null)), false)
                ));
        ensureSubjectLessons(lessons, schoolClass, section, group, "Mathematics", "110",
                List.of(
                        new DemoLesson("Numbers", List.of(new DemoTopic("Counting 1 to 20", null)), false),
                        new DemoLesson("Shapes", List.of(new DemoTopic("Circle and Square", null)), false)
                ));
        ensureSubjectLessons(lessons, schoolClass, section, group, "Science", "111",
                List.of(
                        new DemoLesson("Living and Non-living", List.of(new DemoTopic("Around Us", LocalDate.of(2026, 5, 2))), true),
                        new DemoLesson("Plants Around Us", List.of(new DemoTopic("Parts of a Plant", LocalDate.of(2026, 5, 9))), true)
                ));
        ensureSubjectLessons(lessons, schoolClass, section, group, "Social Studies", "212",
                List.of(
                        new DemoLesson("My Family", List.of(new DemoTopic("Family Members", LocalDate.of(2026, 5, 4))), true),
                        new DemoLesson("Our Neighbourhood", List.of(new DemoTopic("Helpers", LocalDate.of(2026, 5, 11))), true)
                ));
    }

    private void ensureEnglishIncompleteLessons(List<LessonPlanLesson> existing, SchoolClass schoolClass,
                                                String section, SubjectGroup group) {
        List<LessonPlanLesson> englishLessons = existing.stream()
                .filter(lesson -> "English".equalsIgnoreCase(lesson.getSubjectName()))
                .toList();
        if (englishLessons.isEmpty()) {
            return;
        }
        boolean hasIncomplete = englishLessons.stream()
                .flatMap(lesson -> (lesson.getTopics() == null ? List.<LessonPlanTopic>of() : lesson.getTopics()).stream())
                .anyMatch(topic -> statusRepository.findByTopicId(topic.getId())
                        .map(status -> !Boolean.TRUE.equals(status.getCompleted()))
                        .orElse(true));
        if (hasIncomplete) {
            return;
        }
        Subject english = ensureSubject("English", "210");
        createLessonWithTopics(schoolClass, section, group, english,
                new DemoLesson("A Happy Child", List.of(new DemoTopic("6.1 Happiness", null)), false));
        createLessonWithTopics(schoolClass, section, group, english,
                new DemoLesson("After a Bath", List.of(new DemoTopic("7.1 Cleanliness", null)), false));
        createLessonWithTopics(schoolClass, section, group, english,
                new DemoLesson("The Kite", List.of(new DemoTopic("8.1 Flying High", null)), false));
    }

    private void ensureSubjectLessons(List<LessonPlanLesson> existing, SchoolClass schoolClass, String section,
                                      SubjectGroup group, String subjectName, String subjectCode,
                                      List<DemoLesson> demos) {
        boolean hasSubject = existing.stream()
                .anyMatch(lesson -> subjectName.equalsIgnoreCase(lesson.getSubjectName()));
        if (hasSubject) {
            return;
        }
        Subject subject = ensureSubject(subjectName, subjectCode);
        for (DemoLesson demo : demos) {
            createLessonWithTopics(schoolClass, section, group, subject, demo);
        }
    }

    private void createLessonWithTopics(SchoolClass schoolClass, String section, SubjectGroup group,
                                        Subject subject, DemoLesson demo) {
        LessonPlanLesson lesson = LessonPlanLesson.builder()
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .section(section)
                .subjectGroupId(group != null ? group.getId() : null)
                .subjectGroupName(group != null ? group.getName() : "Class subject")
                .subjectId(subject.getId())
                .subjectName(subject.getName())
                .subjectCode(subject.getSubjectCode())
                .lessonName(demo.name())
                .topics(new ArrayList<>())
                .build();
        LessonPlanLesson saved = lessonRepository.save(lesson);
        for (DemoTopic demoTopic : demo.topics()) {
            LessonPlanTopic topic = topicRepository.save(LessonPlanTopic.builder()
                    .lesson(saved)
                    .topicName(demoTopic.name())
                    .build());
            if (demo.completed()) {
                statusRepository.save(LessonPlanSyllabusStatus.builder()
                        .topicId(topic.getId())
                        .completed(true)
                        .completionDate(demoTopic.completionDate() != null ? demoTopic.completionDate() : LocalDate.now())
                        .build());
            }
        }
    }

    private List<LessonPlanLesson> loadLessons(String className, String section, Long classId) {
        if (classId != null) {
            return lessonRepository.findByClassIdAndSectionIgnoreCaseOrderBySubjectNameAscIdAsc(classId, section);
        }
        return lessonRepository.findByClassNameIgnoreCaseAndSectionIgnoreCaseOrderBySubjectNameAscIdAsc(className, section);
    }

    private SchoolClass resolveSchoolClass(String className, Long classId) {
        if (classId != null) {
            return schoolClassRepository.findById(classId).orElse(null);
        }
        return schoolClassRepository.findByNameIgnoreCase(className).orElse(null);
    }

    private SubjectGroup resolveSubjectGroup(SchoolClass schoolClass, String section) {
        return subjectGroupRepository.findAllByOrderByIdDesc().stream()
                .filter(group -> group.getSchoolClass() != null
                        && group.getSchoolClass().getId().equals(schoolClass.getId()))
                .filter(group -> {
                    List<String> sections = group.getSections();
                    return sections == null || sections.isEmpty()
                            || sections.stream().anyMatch(item -> section.equalsIgnoreCase(item));
                })
                .findFirst()
                .orElse(null);
    }

    private Subject ensureSubject(String name, String code) {
        return subjectRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> subjectRepository.save(Subject.builder()
                        .name(name)
                        .subjectCode(code)
                        .build()));
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

    private int percent(int completed, int total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.round(completed * 100.0 / total);
    }

    private String formatSubjectLabel(String name, String code) {
        if (code != null && !code.isBlank()) {
            return text(name) + " (" + code + ")";
        }
        return text(name);
    }

    private boolean numberedTopicName(String name) {
        return name.matches("^\\d+\\.\\d+\\s+.*");
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private record DemoLesson(String name, List<DemoTopic> topics, boolean completed) {
    }

    private record DemoTopic(String name, LocalDate completionDate) {
    }
}
