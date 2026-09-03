package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentAttendanceEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentAttendanceService {

    private static final List<String> STATUSES = List.of(
            "Present", "Late", "Absent", "Holiday", "Half Day"
    );

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StudentAttendanceEntryRepository attendanceEntryRepository;

    public List<String> getStatuses() {
        return STATUSES;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStudents(Long classId, String section, String attendanceDate) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }
        LocalDate date = parseDate(attendanceDate);

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null);

        List<Long> studentIds = students.stream().map(StudentAdmission::getId).toList();
        Map<Long, StudentAttendanceEntry> existing = studentIds.isEmpty()
                ? Map.of()
                : attendanceEntryRepository.findByAttendanceDateAndStudentAdmissionIdIn(date, studentIds).stream()
                        .collect(Collectors.toMap(StudentAttendanceEntry::getStudentAdmissionId, e -> e, (a, b) -> a));

        List<Map<String, Object>> rows = new ArrayList<>();
        int index = 1;
        for (StudentAdmission student : students) {
            StudentAttendanceEntry entry = existing.get(student.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rowNumber", index++);
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo() != null ? student.getAdmissionNo() : "");
            row.put("rollNumber", student.getRollNumber() != null ? student.getRollNumber() : "");
            row.put("studentName", fullName(student));
            row.put("attendanceDate", date.format(US_DATE));
            row.put("status", entry != null ? entry.getStatus() : "Present");
            row.put("source", entry != null && entry.getSource() != null ? entry.getSource() : "Manual");
            row.put("entryTime", entry != null && entry.getEntryTime() != null ? entry.getEntryTime() : "8:45 AM");
            row.put("exitTime", entry != null && entry.getExitTime() != null ? entry.getExitTime() : "9:00 AM");
            row.put("note", entry != null && entry.getNote() != null ? entry.getNote() : "");
            rows.add(row);
        }
        return rows;
    }

    @Transactional
    public void saveAttendance(String attendanceDate, List<Map<String, Object>> records) {
        if (records == null || records.isEmpty()) {
            throw new IllegalArgumentException("No attendance records to save");
        }
        LocalDate date = parseDate(attendanceDate);

        for (Map<String, Object> record : records) {
            Long studentId = longValue(record.get("id"));
            if (studentId == null) {
                continue;
            }
            String status = text(record.get("status"));
            if (status.isBlank()) {
                status = "Present";
            }
            if (!STATUSES.contains(status)) {
                throw new IllegalArgumentException("Invalid attendance status: " + status);
            }

            StudentAttendanceEntry entry = attendanceEntryRepository
                    .findByStudentAdmissionIdAndAttendanceDate(studentId, date)
                    .orElse(StudentAttendanceEntry.builder()
                            .studentAdmissionId(studentId)
                            .attendanceDate(date)
                            .build());

            entry.setStatus(status);
            entry.setSource(text(record.get("source")).isBlank() ? "Manual" : text(record.get("source")));
            entry.setEntryTime(text(record.get("entryTime")));
            entry.setExitTime(text(record.get("exitTime")));
            entry.setNote(text(record.get("note")));
            attendanceEntryRepository.save(entry);
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Attendance date is required");
        }
        String trimmed = value.trim();
        try {
            if (trimmed.contains("/")) {
                return LocalDate.parse(trimmed, US_DATE);
            }
            return LocalDate.parse(trimmed);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid attendance date format");
        }
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
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
}
