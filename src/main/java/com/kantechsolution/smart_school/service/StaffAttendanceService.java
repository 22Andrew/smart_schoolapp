package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffAttendanceEntry;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.repository.StaffAttendanceEntryRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
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
public class StaffAttendanceService {

    private static final List<String> STATUSES = List.of(
            "Present", "Late", "Absent", "Half Day", "Holiday", "Half Day (Second Half)"
    );

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final StaffMemberRepository staffMemberRepository;
    private final StaffAttendanceEntryRepository attendanceEntryRepository;

    public List<String> getStatuses() {
        return STATUSES;
    }

    public List<String> getRoles() {
        return List.of(
                "Super Admin", "Admin", "Teacher", "Faculty", "Technical Head",
                "Principal", "Accountant", "Receptionist", "Librarian"
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchStaff(String role, String attendanceDate) {
        LocalDate date = parseDate(attendanceDate);
        String normalizedRole = role == null ? "" : role.trim();

        List<StaffMember> staffMembers = normalizedRole.isBlank()
                ? staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                : staffMemberRepository.search(normalizedRole, null);

        List<Long> staffIds = staffMembers.stream().map(StaffMember::getId).toList();
        Map<Long, StaffAttendanceEntry> existing = staffIds.isEmpty()
                ? Map.of()
                : attendanceEntryRepository.findByAttendanceDateAndStaffMemberIdIn(date, staffIds).stream()
                        .collect(Collectors.toMap(StaffAttendanceEntry::getStaffMemberId, e -> e, (a, b) -> a));

        List<Map<String, Object>> rows = new ArrayList<>();
        int index = 1;
        for (StaffMember staff : staffMembers) {
            StaffAttendanceEntry entry = existing.get(staff.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rowNumber", index++);
            row.put("id", staff.getId());
            row.put("staffId", staff.getStaffId() != null ? staff.getStaffId() : "");
            row.put("staffName", fullName(staff));
            row.put("role", primaryRole(staff.getRoles()));
            row.put("attendanceDate", date.format(US_DATE));
            row.put("status", entry != null ? entry.getStatus() : "Absent");
            row.put("source", entry != null && entry.getSource() != null ? entry.getSource() : "N/A");
            row.put("entryTime", entry != null && entry.getEntryTime() != null ? entry.getEntryTime() : "");
            row.put("exitTime", entry != null && entry.getExitTime() != null ? entry.getExitTime() : "");
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
            Long staffMemberId = longValue(record.get("id"));
            if (staffMemberId == null) {
                continue;
            }
            String status = text(record.get("status"));
            if (status.isBlank()) {
                status = "Absent";
            }
            if (!STATUSES.contains(status)) {
                throw new IllegalArgumentException("Invalid attendance status: " + status);
            }

            StaffAttendanceEntry entry = attendanceEntryRepository
                    .findByStaffMemberIdAndAttendanceDate(staffMemberId, date)
                    .orElse(StaffAttendanceEntry.builder()
                            .staffMemberId(staffMemberId)
                            .attendanceDate(date)
                            .build());

            entry.setStatus(status);
            entry.setSource(text(record.get("source")).isBlank() ? "N/A" : text(record.get("source")));
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

    private String fullName(StaffMember staff) {
        String first = staff.getFirstName() != null ? staff.getFirstName().trim() : "";
        String last = staff.getLastName() != null ? staff.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private String primaryRole(String roles) {
        if (roles == null || roles.isBlank()) {
            return "";
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .findFirst()
                .orElse("");
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
