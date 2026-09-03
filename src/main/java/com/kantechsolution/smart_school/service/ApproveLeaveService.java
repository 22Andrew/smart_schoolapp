package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentLeaveRequest;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentLeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ApproveLeaveService {

    private static final List<String> STATUSES = List.of("Pending", "Approve", "Disapprove");
    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final String DEFAULT_APPROVER_NAME = "Joe Black";
    private static final String DEFAULT_APPROVER_STAFF_ID = "9000";

    private final StudentLeaveRequestRepository leaveRequestRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final UploadStorage uploadStorage;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchLeaves(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        return leaveRequestRepository.findByClassIdAndSectionOrderByApplyDateDescIdDesc(classId, section.trim())
                .stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLeaveById(Long id) {
        StudentLeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));
        return toMap(leave);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudents(Long classId, String section) {
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        List<StudentAdmission> students = studentAdmissionRepository.search(
                classId, section.trim(), null, false, null);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentAdmission student : students) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", student.getId());
            row.put("admissionNo", student.getAdmissionNo() != null ? student.getAdmissionNo() : "");
            row.put("studentName", fullName(student));
            row.put("classId", student.getSchoolClass() != null ? student.getSchoolClass().getId() : classId);
            row.put("className", student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
            row.put("section", student.getSection() != null ? student.getSection() : section.trim());
            rows.add(row);
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createLeave(Map<String, Object> payload, MultipartFile document) {
        StudentLeaveRequest leave = buildLeaveFromPayload(new StudentLeaveRequest(), payload);
        if (document != null && !document.isEmpty()) {
            leave.setDocumentPath(storeDocument(document));
        }
        applyApprovalMeta(leave);
        return toMap(leaveRequestRepository.save(leave));
    }

    @Transactional
    public Map<String, Object> updateLeave(Long id, Map<String, Object> payload, MultipartFile document) {
        StudentLeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));
        buildLeaveFromPayload(leave, payload);
        if (document != null && !document.isEmpty()) {
            leave.setDocumentPath(storeDocument(document));
        }
        applyApprovalMeta(leave);
        return toMap(leaveRequestRepository.save(leave));
    }

    @Transactional
    public void deleteLeave(Long id) {
        if (!leaveRequestRepository.existsById(id)) {
            throw new IllegalArgumentException("Leave request not found");
        }
        leaveRequestRepository.deleteById(id);
    }

    private StudentLeaveRequest buildLeaveFromPayload(StudentLeaveRequest leave, Map<String, Object> payload) {
        Long studentId = longValue(payload.get("studentAdmissionId"));
        if (studentId == null) {
            throw new IllegalArgumentException("Student is required");
        }

        StudentAdmission student = studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Long classId = longValue(payload.get("classId"));
        if (classId == null && student.getSchoolClass() != null) {
            classId = student.getSchoolClass().getId();
        }
        String section = text(payload.get("section"));
        if (section.isBlank()) {
            section = student.getSection() != null ? student.getSection() : "";
        }

        leave.setStudentAdmissionId(studentId);
        leave.setClassId(classId);
        leave.setClassName(text(payload.get("className")).isBlank()
                ? (student.getSchoolClass() != null ? student.getSchoolClass().getName() : "")
                : text(payload.get("className")));
        leave.setSection(section);
        leave.setStudentName(text(payload.get("studentName")).isBlank() ? fullName(student) : text(payload.get("studentName")));
        leave.setAdmissionNo(student.getAdmissionNo() != null ? student.getAdmissionNo() : "");
        leave.setApplyDate(parseDate(payload.get("applyDate"), "Apply date is required"));
        leave.setFromDate(parseDate(payload.get("fromDate"), "From date is required"));
        leave.setToDate(parseDate(payload.get("toDate"), "To date is required"));
        leave.setReason(text(payload.get("reason")));

        String status = text(payload.get("status"));
        if (status.isBlank()) {
            status = "Pending";
        }
        if (!STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid leave status");
        }
        leave.setStatus(status);
        return leave;
    }

    private void applyApprovalMeta(StudentLeaveRequest leave) {
        if ("Pending".equalsIgnoreCase(leave.getStatus())) {
            leave.setApprovedByName(null);
            leave.setApprovedByStaffId(null);
            leave.setActionDate(null);
            return;
        }
        leave.setApprovedByName(DEFAULT_APPROVER_NAME);
        leave.setApprovedByStaffId(DEFAULT_APPROVER_STAFF_ID);
        if (leave.getActionDate() == null) {
            leave.setActionDate(LocalDate.now());
        }
    }

    private Map<String, Object> toMap(StudentLeaveRequest leave) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", leave.getId());
        map.put("studentAdmissionId", leave.getStudentAdmissionId());
        map.put("classId", leave.getClassId());
        map.put("className", leave.getClassName());
        map.put("section", leave.getSection());
        map.put("studentName", leave.getStudentName());
        map.put("admissionNo", leave.getAdmissionNo());
        map.put("studentDisplay", leave.getStudentName()
                + (leave.getAdmissionNo() != null && !leave.getAdmissionNo().isBlank()
                ? " (" + leave.getAdmissionNo() + ")" : ""));
        map.put("applyDate", formatDate(leave.getApplyDate()));
        map.put("fromDate", formatDate(leave.getFromDate()));
        map.put("toDate", formatDate(leave.getToDate()));
        map.put("reason", leave.getReason() != null ? leave.getReason() : "");
        map.put("status", leave.getStatus());
        map.put("statusDisplay", formatStatusDisplay(leave));
        map.put("approvedByDisplay", formatApprovedBy(leave));
        map.put("approvedByName", leave.getApprovedByName());
        map.put("approvedByStaffId", leave.getApprovedByStaffId());
        map.put("actionDate", formatDate(leave.getActionDate()));
        map.put("documentPath", leave.getDocumentPath());
        return map;
    }

    private String formatStatusDisplay(StudentLeaveRequest leave) {
        String status = leave.getStatus() != null ? leave.getStatus() : "Pending";
        if ("Approve".equalsIgnoreCase(status)) {
            if (leave.getActionDate() != null) {
                return "Approved (" + leave.getActionDate().format(US_DATE) + ")";
            }
            return "Approved";
        }
        if ("Disapprove".equalsIgnoreCase(status)) {
            return "Disapproved";
        }
        return "Pending";
    }

    private String formatApprovedBy(StudentLeaveRequest leave) {
        if ("Pending".equalsIgnoreCase(leave.getStatus())) {
            return "";
        }
        if (leave.getApprovedByName() == null || leave.getApprovedByName().isBlank()) {
            return "";
        }
        if (leave.getApprovedByStaffId() != null && !leave.getApprovedByStaffId().isBlank()) {
            return leave.getApprovedByName() + " (" + leave.getApprovedByStaffId() + ")";
        }
        return leave.getApprovedByName();
    }

    private String storeDocument(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        if (extension.isBlank()) {
            extension = ".pdf";
        }

        try {
            Path uploadDir = uploadStorage.getLeavesDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/leaves/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store document: " + e.getMessage());
        }
    }

    private LocalDate parseDate(Object value, String errorMessage) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }
        String trimmed = String.valueOf(value).trim();
        try {
            if (trimmed.contains("/")) {
                return LocalDate.parse(trimmed, US_DATE);
            }
            return LocalDate.parse(trimmed);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid date format");
        }
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(US_DATE) : "";
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
