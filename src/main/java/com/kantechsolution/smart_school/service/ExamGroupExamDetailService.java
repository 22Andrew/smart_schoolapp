package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamGroupExamDetailService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final List<String> SESSION_OPTIONS = List.of(
            "2016-17", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22",
            "2022-23", "2023-24", "2024-25", "2025-26", "2026-27"
    );

    private final ExamGroupExamRepository examGroupExamRepository;
    private final ExamScheduleEntryRepository examScheduleEntryRepository;
    private final ExamGroupExamStudentRepository examGroupExamStudentRepository;
    private final ExamGroupExamTeacherRemarkRepository teacherRemarkRepository;
    private final ExamResultRecordRepository examResultRecordRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final SubjectRepository subjectRepository;
    private final MarksheetTemplateRepository marksheetTemplateRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getFormOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("sessions", SESSION_OPTIONS);
        options.put("subjects", subjectRepository.findAllByOrderByIdAsc().stream()
                .map(this::formatSubjectLabel)
                .toList());
        options.put("marksheetTemplates", marksheetTemplateRepository.findAllByOrderByTemplateNameAsc().stream()
                .map(template -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", template.getId());
                    map.put("name", template.getTemplateName());
                    return map;
                })
                .toList());
        return options;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExamDetail(Long groupId, Long examId) {
        ExamGroupExam exam = requireExam(groupId, examId);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", exam.getId());
        map.put("name", exam.getName());
        map.put("session", defaultSession(exam.getSessionYear()));
        map.put("publishExam", exam.getPublishExam() == null || Boolean.TRUE.equals(exam.getPublishExam()));
        map.put("publishResult", exam.getPublishResult() == null || Boolean.TRUE.equals(exam.getPublishResult()));
        map.put("rollType", exam.getRollType() != null ? exam.getRollType() : "ADMIT_CARD");
        map.put("marksheetTemplateId", exam.getMarksheetTemplateId());
        map.put("description", exam.getDescription() != null ? exam.getDescription() : exam.getName());
        map.put("examGroupName", exam.getExamGroup().getName());
        return map;
    }

    @Transactional
    public Map<String, Object> updateExam(Long groupId, Long examId, Map<String, Object> body) {
        ExamGroupExam exam = requireExam(groupId, examId);
        String name = text(body.get("name"));
        if (name.isBlank()) {
            throw new IllegalArgumentException("Exam name is required");
        }
        exam.setName(name.trim());
        exam.setSessionYear(text(body.get("session")));
        exam.setPublishExam(asBoolean(body.get("publishExam")));
        exam.setPublishResult(asBoolean(body.get("publishResult")));
        exam.setRollType(text(body.get("rollType")));
        exam.setMarksheetTemplateId(parseLong(body.get("marksheetTemplateId")));
        exam.setDescription(text(body.get("description")));
        examGroupExamRepository.save(exam);
        return getExamDetail(groupId, examId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSubjectModalData(Long groupId, Long examId) {
        ExamGroupExam exam = requireExam(groupId, examId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examName", exam.getName());
        response.put("examGroupName", exam.getExamGroup().getName());
        response.put("subjects", examScheduleEntryRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(this::toSubjectRow)
                .toList());
        return response;
    }

    @Transactional
    public void saveSubjects(Long groupId, Long examId, List<Map<String, Object>> rows) {
        ExamGroupExam exam = requireExam(groupId, examId);
        examScheduleEntryRepository.deleteByExamGroupExamId(exam.getId());
        if (rows == null) {
            return;
        }
        for (Map<String, Object> row : rows) {
            String subjectName = text(row.get("subjectName"));
            if (subjectName.isBlank()) {
                continue;
            }
            examScheduleEntryRepository.save(ExamScheduleEntry.builder()
                    .examGroupExam(exam)
                    .subjectName(subjectName.trim())
                    .dateFrom(parseDate(row.get("examDate")))
                    .startTime(parseTime(row.get("startTime")))
                    .durationMinutes(parseInteger(row.get("durationMinutes")))
                    .creditHours(parseDecimal(row.get("creditHours")))
                    .roomNo(text(row.get("roomNo")))
                    .marksMax(parseDecimal(row.get("marksMax")))
                    .marksMin(parseDecimal(row.get("marksMin")))
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMarksView(Long groupId, Long examId) {
        ExamGroupExam exam = requireExam(groupId, examId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examName", exam.getName());
        response.put("examGroupName", exam.getExamGroup().getName());
        response.put("subjects", examScheduleEntryRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(entry -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", entry.getId());
                    map.put("subject", entry.getSubjectName());
                    map.put("dateFrom", formatDate(entry.getDateFrom()));
                    map.put("startTime", formatTime(entry.getStartTime()));
                    map.put("duration", entry.getDurationMinutes());
                    map.put("roomNo", defaultText(entry.getRoomNo()));
                    map.put("marksMax", formatDecimal(entry.getMarksMax()));
                    map.put("marksMin", formatDecimal(entry.getMarksMin()));
                    return map;
                })
                .toList());
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSubjectMarksEntry(Long groupId, Long examId, Long subjectEntryId,
                                                    Long classId, String section, String sessionYear) {
        ExamGroupExam exam = requireExam(groupId, examId);
        ExamScheduleEntry entry = examScheduleEntryRepository.findById(subjectEntryId)
                .filter(item -> item.getExamGroupExam().getId().equals(exam.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        String session = sessionYear != null && !sessionYear.isBlank()
                ? sessionYear.trim()
                : defaultSession(exam.getSessionYear());

        Set<Long> assignedIds = examGroupExamStudentRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(ExamGroupExamStudent::getStudentAdmissionId)
                .collect(Collectors.toSet());

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null).stream()
                .filter(student -> assignedIds.contains(student.getId()))
                .toList();

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            BigDecimal marks = null;
            boolean absent = false;
            String note = "";
            ExamResultRecord record = examResultRecordRepository
                    .findByExamGroupExamIdAndStudentAdmissionId(exam.getId(), student.getId())
                    .orElse(null);
            if (record != null) {
                ExamResultSubjectMark subjectMark = record.getSubjectMarks().stream()
                        .filter(mark -> matchesSubject(mark, entry))
                        .findFirst()
                        .orElse(null);
                if (subjectMark != null) {
                    absent = Boolean.TRUE.equals(subjectMark.getAbsent());
                    note = defaultText(subjectMark.getNote());
                    if (!absent && subjectMark.getMarksObtained() != null) {
                        marks = subjectMark.getMarksObtained();
                    }
                }
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentId", student.getId());
            row.put("studentName", fullName(student));
            row.put("admissionNo", student.getAdmissionNo());
            row.put("rollNumber", defaultText(student.getRollNumber()));
            row.put("fatherName", defaultText(student.getFatherName()));
            row.put("category", student.getCategory() != null ? student.getCategory().getCategoryName() : "");
            row.put("gender", defaultText(student.getGender()));
            row.put("absent", absent);
            row.put("marksObtained", absent ? "" : formatDecimal(marks));
            row.put("note", note);
            rows.add(row);
        }

        String[] subjectParts = parseSubjectParts(entry.getSubjectName());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subjectName", subjectParts[0]);
        response.put("subjectLabel", entry.getSubjectName());
        response.put("marksMax", formatDecimal(entry.getMarksMax()));
        response.put("session", session);
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public void saveSubjectMarks(Long groupId, Long examId, Long subjectEntryId,
                                 String sessionYear, List<Map<String, Object>> rows) {
        ExamGroupExam exam = requireExam(groupId, examId);
        ExamScheduleEntry entry = examScheduleEntryRepository.findById(subjectEntryId)
                .filter(item -> item.getExamGroupExam().getId().equals(exam.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        String session = sessionYear != null && !sessionYear.isBlank()
                ? sessionYear.trim()
                : defaultSession(exam.getSessionYear());
        String[] subjectParts = parseSubjectParts(entry.getSubjectName());

        if (rows != null) {
            for (Map<String, Object> row : rows) {
                Long studentId = parseLong(row.get("studentId"));
                if (studentId == null) {
                    continue;
                }
                boolean absent = asBoolean(row.get("absent"));
                BigDecimal obtained = absent ? null : parseDecimal(row.get("marksObtained"));
                String note = text(row.get("note"));
                ExamResultRecord record = examResultRecordRepository
                        .findByExamGroupExamIdAndStudentAdmissionId(exam.getId(), studentId)
                        .orElseGet(() -> {
                            StudentAdmission student = studentAdmissionRepository.findById(studentId)
                                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
                            return ExamResultRecord.builder()
                                    .examGroupExam(exam)
                                    .studentAdmission(student)
                                    .sessionYear(session)
                                    .subjectMarks(new ArrayList<>())
                                    .build();
                        });
                record.setSessionYear(session);

                ExamResultSubjectMark mark = record.getSubjectMarks().stream()
                        .filter(item -> matchesSubject(item, entry))
                        .findFirst()
                        .orElseGet(() -> {
                            ExamResultSubjectMark created = ExamResultSubjectMark.builder()
                                    .examResultRecord(record)
                                    .subjectName(subjectParts[0])
                                    .subjectCode(subjectParts[1])
                                    .marksMax(entry.getMarksMax())
                                    .marksObtained(BigDecimal.ZERO)
                                    .absent(false)
                                    .note("")
                                    .build();
                            record.getSubjectMarks().add(created);
                            return created;
                        });
                mark.setAbsent(absent);
                mark.setNote(note);
                mark.setMarksObtained(absent ? null : (obtained != null ? obtained : BigDecimal.ZERO));
                mark.setMarksMax(entry.getMarksMax());
                examResultRecordRepository.save(record);
            }
        }
        recalculateExamTotals(exam, session);
    }

    @Transactional(readOnly = true)
    public byte[] exportSubjectMarksSample(Long groupId, Long examId, Long subjectEntryId,
                                           Long classId, String section, String sessionYear) {
        Map<String, Object> data = getSubjectMarksEntry(groupId, examId, subjectEntryId, classId, section, sessionYear);
        StringBuilder csv = new StringBuilder();
        csv.append("Admission No,Roll Number,Student Name,Father Name,Category,Gender,Absent,Marks,Note\n");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rows = (List<Map<String, Object>>) data.get("rows");
        for (Map<String, Object> row : rows) {
            csv.append(csvCell(row.get("admissionNo"))).append(',')
                    .append(csvCell(row.get("rollNumber"))).append(',')
                    .append(csvCell(row.get("studentName"))).append(',')
                    .append(csvCell(row.get("fatherName"))).append(',')
                    .append(csvCell(row.get("category"))).append(',')
                    .append(csvCell(row.get("gender"))).append(',')
                    .append(Boolean.TRUE.equals(row.get("absent")) ? "Yes" : "No").append(',')
                    .append(csvCell(row.get("marksObtained"))).append(',')
                    .append(csvCell(row.get("note"))).append('\n');
        }
        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String csvCell(Object value) {
        String text = value == null ? "" : String.valueOf(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherRemarks(Long groupId, Long examId) {
        ExamGroupExam exam = requireExam(groupId, examId);
        Map<Long, String> remarkMap = teacherRemarkRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .collect(Collectors.toMap(
                        ExamGroupExamTeacherRemark::getStudentAdmissionId,
                        item -> defaultText(item.getRemark()),
                        (a, b) -> b));

        List<Map<String, Object>> rows = examGroupExamStudentRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(assignment -> studentAdmissionRepository.findById(assignment.getStudentAdmissionId()).orElse(null))
                .filter(Objects::nonNull)
                .map(student -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("studentId", student.getId());
                    row.put("studentName", fullName(student));
                    row.put("admissionNo", student.getAdmissionNo());
                    row.put("className", student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
                    row.put("section", defaultText(student.getSection()));
                    row.put("rollNumber", defaultText(student.getRollNumber()));
                    row.put("remark", remarkMap.getOrDefault(student.getId(), ""));
                    return row;
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examName", exam.getName());
        response.put("examGroupName", exam.getExamGroup().getName());
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public void saveTeacherRemarks(Long groupId, Long examId, List<Map<String, Object>> rows) {
        ExamGroupExam exam = requireExam(groupId, examId);
        if (rows == null) {
            return;
        }
        for (Map<String, Object> row : rows) {
            Long studentId = parseLong(row.get("studentId"));
            if (studentId == null) {
                continue;
            }
            String remark = text(row.get("remark"));
            ExamGroupExamTeacherRemark entity = teacherRemarkRepository
                    .findByExamGroupExamIdAndStudentAdmissionId(exam.getId(), studentId)
                    .orElseGet(() -> ExamGroupExamTeacherRemark.builder()
                            .examGroupExam(exam)
                            .studentAdmissionId(studentId)
                            .build());
            entity.setRemark(remark);
            teacherRemarkRepository.save(entity);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRankData(Long groupId, Long examId) {
        ExamGroupExam exam = requireExam(groupId, examId);
        String session = defaultSession(exam.getSessionYear());
        BigDecimal maxTotal = examScheduleEntryRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(ExamScheduleEntry::getMarksMax)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> rows = new ArrayList<>();
        List<ExamResultRecord> records = examResultRecordRepository.findByExamGroupExamIdOrderByStudentRankAsc(exam.getId());
        if (!records.isEmpty()) {
            for (ExamResultRecord record : records) {
                rows.add(toRankRow(record, maxTotal));
            }
        } else {
            rows = examGroupExamStudentRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                    .map(assignment -> studentAdmissionRepository.findById(assignment.getStudentAdmissionId()).orElse(null))
                    .filter(Objects::nonNull)
                    .map(student -> previewRankRow(student, maxTotal))
                    .toList();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examName", exam.getName());
        response.put("rankGenerated", Boolean.TRUE.equals(exam.getRankGenerated()));
        response.put("rows", rows);
        return response;
    }

    @Transactional
    public Map<String, Object> generateRank(Long groupId, Long examId) {
        ExamGroupExam exam = requireExam(groupId, examId);
        List<ExamGroupExamStudent> assigned = examGroupExamStudentRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId());
        if (assigned.isEmpty()) {
            throw new IllegalArgumentException("Assign students before generating rank");
        }
        String session = defaultSession(exam.getSessionYear());
        recalculateExamTotals(exam, session);

        List<ExamResultRecord> records = examResultRecordRepository.findByExamGroupExamIdOrderByStudentRankAsc(exam.getId());
        int rank = 1;
        for (ExamResultRecord record : records) {
            record.setStudentRank(rank++);
            examResultRecordRepository.save(record);
        }
        exam.setRankGenerated(true);
        examGroupExamRepository.save(exam);
        return getRankData(groupId, examId);
    }

    private void recalculateExamTotals(ExamGroupExam exam, String session) {
        BigDecimal maxTotal = examScheduleEntryRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(ExamScheduleEntry::getMarksMax)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<Long> assignedIds = examGroupExamStudentRepository.findByExamGroupExamIdOrderByIdAsc(exam.getId()).stream()
                .map(ExamGroupExamStudent::getStudentAdmissionId)
                .collect(Collectors.toSet());

        List<ExamResultRecord> records = new ArrayList<>();
        for (Long studentId : assignedIds) {
            ExamResultRecord record = examResultRecordRepository
                    .findByExamGroupExamIdAndStudentAdmissionId(exam.getId(), studentId)
                    .orElseGet(() -> {
                        StudentAdmission student = studentAdmissionRepository.findById(studentId).orElse(null);
                        if (student == null) {
                            return null;
                        }
                        return ExamResultRecord.builder()
                                .examGroupExam(exam)
                                .studentAdmission(student)
                                .sessionYear(session)
                                .subjectMarks(new ArrayList<>())
                                .build();
                    });
            if (record == null) {
                continue;
            }
            BigDecimal total = record.getSubjectMarks().stream()
                    .filter(mark -> !Boolean.TRUE.equals(mark.getAbsent()))
                    .map(ExamResultSubjectMark::getMarksObtained)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            record.setGrandTotal(total);
            if (maxTotal.compareTo(BigDecimal.ZERO) > 0) {
                record.setPercent(total.multiply(new BigDecimal("100"))
                        .divide(maxTotal, 2, RoundingMode.HALF_UP));
            } else {
                record.setPercent(BigDecimal.ZERO);
            }
            records.add(record);
        }

        records.sort((a, b) -> {
            BigDecimal totalA = a.getGrandTotal() != null ? a.getGrandTotal() : BigDecimal.ZERO;
            BigDecimal totalB = b.getGrandTotal() != null ? b.getGrandTotal() : BigDecimal.ZERO;
            return totalB.compareTo(totalA);
        });

        int rank = 1;
        for (ExamResultRecord record : records) {
            record.setStudentRank(rank++);
            examResultRecordRepository.save(record);
        }
    }

    private Map<String, Object> toRankRow(ExamResultRecord record, BigDecimal maxTotal) {
        StudentAdmission student = record.getStudentAdmission();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("studentId", student.getId());
        row.put("admissionNo", student.getAdmissionNo());
        row.put("rollNumber", defaultText(student.getRollNumber()));
        row.put("className", student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
        row.put("section", defaultText(student.getSection()));
        row.put("studentName", fullName(student));
        row.put("result", formatDecimal(record.getGrandTotal()) + "/" + formatDecimal(maxTotal));
        row.put("percent", formatDecimal(record.getPercent()));
        row.put("rank", record.getStudentRank() != null ? record.getStudentRank() : "");
        return row;
    }

    private Map<String, Object> previewRankRow(StudentAdmission student, BigDecimal maxTotal) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("studentId", student.getId());
        row.put("admissionNo", student.getAdmissionNo());
        row.put("rollNumber", defaultText(student.getRollNumber()));
        row.put("className", student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
        row.put("section", defaultText(student.getSection()));
        row.put("studentName", fullName(student));
        row.put("result", "0.00/" + formatDecimal(maxTotal));
        row.put("percent", "0.00");
        row.put("rank", "");
        return row;
    }

    private Map<String, Object> toSubjectRow(ExamScheduleEntry entry) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", entry.getId());
        map.put("subjectName", entry.getSubjectName());
        map.put("examDate", toInputDate(entry.getDateFrom()));
        map.put("startTime", toInputTime(entry.getStartTime()));
        map.put("durationMinutes", entry.getDurationMinutes());
        map.put("creditHours", formatDecimal(entry.getCreditHours()));
        map.put("roomNo", defaultText(entry.getRoomNo()));
        map.put("marksMax", formatDecimal(entry.getMarksMax()));
        map.put("marksMin", formatDecimal(entry.getMarksMin()));
        return map;
    }

    private ExamGroupExam requireExam(Long groupId, Long examId) {
        return examGroupExamRepository.findByIdAndExamGroupId(examId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    private String formatSubjectLabel(Subject subject) {
        if (subject.getSubjectCode() != null && !subject.getSubjectCode().isBlank()) {
            return subject.getName() + " (" + subject.getSubjectCode() + ")";
        }
        return subject.getName();
    }

    private boolean matchesSubject(ExamResultSubjectMark mark, ExamScheduleEntry entry) {
        if (entry.getSubjectName() != null && entry.getSubjectName().equalsIgnoreCase(mark.getSubjectName())) {
            return true;
        }
        String[] parts = parseSubjectParts(entry.getSubjectName());
        return parts[0].equalsIgnoreCase(mark.getSubjectName())
                && (parts[1].isBlank() || parts[1].equalsIgnoreCase(defaultText(mark.getSubjectCode())));
    }

    private String[] parseSubjectParts(String subjectLabel) {
        if (subjectLabel == null) {
            return new String[]{"", ""};
        }
        int open = subjectLabel.lastIndexOf('(');
        int close = subjectLabel.lastIndexOf(')');
        if (open > 0 && close > open) {
            return new String[]{
                    subjectLabel.substring(0, open).trim(),
                    subjectLabel.substring(open + 1, close).trim()
            };
        }
        return new String[]{subjectLabel.trim(), ""};
    }

    private String fullName(StudentAdmission student) {
        return (student.getFirstName() + " " + (student.getLastName() != null ? student.getLastName() : "")).trim();
    }

    private String defaultSession(String session) {
        return session == null || session.isBlank() ? "2026-27" : session;
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FMT) : "";
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FMT) : "";
    }

    private String toInputDate(LocalDate date) {
        return date != null ? date.toString() : "";
    }

    private String toInputTime(LocalTime time) {
        return time != null ? time.format(TIME_FMT) : "";
    }

    private LocalDate parseDate(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        if (text.contains("-")) {
            return LocalDate.parse(text);
        }
        return LocalDate.parse(text, DATE_FMT);
    }

    private LocalTime parseTime(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        if (text.length() == 5) {
            return LocalTime.parse(text + ":00");
        }
        return LocalTime.parse(text);
    }

    private Integer parseInteger(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private Long parseLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.parseLong(String.valueOf(value));
    }

    private BigDecimal parseDecimal(Object value) {
        String text = text(value);
        if (text.isBlank()) {
            return null;
        }
        return new BigDecimal(text);
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "";
        }
        return value.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
    }

    private boolean asBoolean(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        return value != null && Boolean.parseBoolean(String.valueOf(value));
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String defaultText(String value) {
        return value == null ? "" : value;
    }
}
