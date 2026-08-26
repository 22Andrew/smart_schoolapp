package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentLeaveRequest;
import com.kantechsolution.smart_school.repository.StudentLeaveRequestRepository;
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
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class UserPanelApplyLeaveService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final UserPanelContextService contextService;
    private final StudentLeaveRequestRepository leaveRequestRepository;
    private final UploadStorage uploadStorage;

    public UserPanelApplyLeaveService(UserPanelContextService contextService,
                                      StudentLeaveRequestRepository leaveRequestRepository,
                                      UploadStorage uploadStorage) {
        this.contextService = contextService;
        this.leaveRequestRepository = leaveRequestRepository;
        this.uploadStorage = uploadStorage;
    }

    @Transactional
    public Map<String, Object> listLeaves(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = requireStudentId(student);
        ensureDemoLeaves(student, studentId);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StudentLeaveRequest leave : leaveRequestRepository
                .findByStudentAdmissionIdOrderByApplyDateDescIdDesc(studentId)) {
            rows.add(toRow(leave));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLeave(Authentication authentication, Long id) {
        return toRow(requireOwnedLeave(authentication, id));
    }

    @Transactional
    public Map<String, Object> saveLeave(Authentication authentication, Long id,
                                         String applyDate, String fromDate, String toDate,
                                         String reason, MultipartFile document) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = requireStudentId(student);
        StudentLeaveRequest leave;
        if (id == null) {
            leave = new StudentLeaveRequest();
            leave.setStudentAdmissionId(studentId);
            leave.setStatus("Pending");
            leave.setIsActive(true);
        } else {
            leave = requireOwnedLeave(authentication, id);
            if (!isPending(leave)) {
                throw new IllegalArgumentException("Approved leave cannot be edited");
            }
        }

        leave.setClassId(resolveClassId(student));
        leave.setClassName(resolveClassName(student));
        leave.setSection(resolveSection(student));
        leave.setStudentName(contextService.resolveStudentName(student));
        leave.setAdmissionNo(contextService.resolveAdmissionNo(student));
        leave.setApplyDate(parseDate(applyDate, "Apply date is required"));
        leave.setFromDate(parseDate(fromDate, "From date is required"));
        leave.setToDate(parseDate(toDate, "To date is required"));
        if (leave.getToDate().isBefore(leave.getFromDate())) {
            throw new IllegalArgumentException("To date cannot be before from date");
        }
        leave.setReason(reason == null ? "" : reason.trim());
        if (document != null && !document.isEmpty()) {
            leave.setDocumentPath(storeDocument(document));
        }
        StudentLeaveRequest saved = leaveRequestRepository.save(leave);
        Map<String, Object> response = toRow(saved);
        response.put("success", true);
        response.put("message", id == null ? "Leave saved successfully" : "Leave updated successfully");
        return response;
    }

    @Transactional
    public Map<String, Object> deleteLeave(Authentication authentication, Long id) {
        StudentLeaveRequest leave = requireOwnedLeave(authentication, id);
        if (!isPending(leave)) {
            throw new IllegalArgumentException("Approved leave cannot be deleted");
        }
        leaveRequestRepository.delete(leave);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Leave deleted successfully");
        return response;
    }

    private void ensureDemoLeaves(StudentAdmission student, Long studentId) {
        if (leaveRequestRepository.existsByStudentAdmissionId(studentId)) {
            return;
        }
        String className = resolveClassName(student);
        String section = resolveSection(student);
        Long classId = resolveClassId(student);
        String studentName = contextService.resolveStudentName(student);
        String admissionNo = contextService.resolveAdmissionNo(student);

        saveSeed(studentId, classId, className, section, studentName, admissionNo,
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 16), LocalDate.of(2026, 4, 17),
                "sick", "Approve", LocalDate.of(2026, 4, 2));
        saveSeed(studentId, classId, className, section, studentName, admissionNo,
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 8), LocalDate.of(2026, 4, 9),
                "sick", "Pending", null);
        saveSeed(studentId, classId, className, section, studentName, admissionNo,
                LocalDate.of(2026, 3, 20), LocalDate.of(2026, 3, 22), LocalDate.of(2026, 3, 22),
                "emergency", "Pending", null);
        saveSeed(studentId, classId, className, section, studentName, admissionNo,
                LocalDate.of(2026, 2, 10), LocalDate.of(2026, 2, 12), LocalDate.of(2026, 2, 13),
                "SICK", "Approve", LocalDate.of(2026, 2, 11));
    }

    private void saveSeed(Long studentId, Long classId, String className, String section,
                          String studentName, String admissionNo,
                          LocalDate applyDate, LocalDate fromDate, LocalDate toDate,
                          String reason, String status, LocalDate actionDate) {
        StudentLeaveRequest leave = StudentLeaveRequest.builder()
                .studentAdmissionId(studentId)
                .classId(classId)
                .className(className)
                .section(section)
                .studentName(studentName)
                .admissionNo(admissionNo)
                .applyDate(applyDate)
                .fromDate(fromDate)
                .toDate(toDate)
                .reason(reason)
                .status(status)
                .actionDate(actionDate)
                .approvedByName("Approve".equalsIgnoreCase(status) ? "Joe Black" : null)
                .approvedByStaffId("Approve".equalsIgnoreCase(status) ? "9000" : null)
                .build();
        leave.setIsActive(true);
        leaveRequestRepository.save(leave);
    }

    private StudentLeaveRequest requireOwnedLeave(Authentication authentication, Long id) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        Long studentId = requireStudentId(student);
        StudentLeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));
        if (!studentId.equals(leave.getStudentAdmissionId())) {
            throw new IllegalArgumentException("Leave request not found");
        }
        return leave;
    }

    private Map<String, Object> toRow(StudentLeaveRequest leave) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", leave.getId());
        row.put("className", text(leave.getClassName()));
        row.put("section", text(leave.getSection()));
        row.put("applyDate", formatDate(leave.getApplyDate()));
        row.put("fromDate", formatDate(leave.getFromDate()));
        row.put("toDate", formatDate(leave.getToDate()));
        row.put("reason", text(leave.getReason()));
        row.put("status", leave.getStatus() == null ? "Pending" : leave.getStatus());
        row.put("statusDisplay", formatStatusDisplay(leave));
        row.put("documentPath", leave.getDocumentPath() == null ? "" : leave.getDocumentPath());
        row.put("canEdit", isPending(leave));
        return row;
    }

    private String formatStatusDisplay(StudentLeaveRequest leave) {
        String status = leave.getStatus() != null ? leave.getStatus() : "Pending";
        if ("Approve".equalsIgnoreCase(status) || "Approved".equalsIgnoreCase(status)) {
            if (leave.getActionDate() != null) {
                return "Approved (" + leave.getActionDate().format(US_DATE) + ")";
            }
            return "Approved";
        }
        if ("Disapprove".equalsIgnoreCase(status) || "Disapproved".equalsIgnoreCase(status)) {
            return "Disapproved";
        }
        return "Pending";
    }

    private boolean isPending(StudentLeaveRequest leave) {
        return leave.getStatus() == null || "Pending".equalsIgnoreCase(leave.getStatus());
    }

    private Long requireStudentId(StudentAdmission student) {
        if (student != null && student.getId() != null) {
            return student.getId();
        }
        return 1L;
    }

    private Long resolveClassId(StudentAdmission student) {
        if (student != null && student.getSchoolClass() != null && student.getSchoolClass().getId() != null) {
            return student.getSchoolClass().getId();
        }
        return 1L;
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

    private String storeDocument(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT)
                : ".pdf";
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

    private LocalDate parseDate(String value, String errorMessage) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }
        String trimmed = value.trim();
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
        return date == null ? "" : date.format(US_DATE);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
