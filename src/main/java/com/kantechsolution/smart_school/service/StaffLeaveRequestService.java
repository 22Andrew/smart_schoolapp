package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.StaffLeaveRequest;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.repository.StaffLeaveRequestRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(7)
public class StaffLeaveRequestService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final String DEFAULT_SUBMITTER_NAME = "Joe Black";
    private static final String DEFAULT_SUBMITTER_STAFF_ID = "9000";

    private final StaffLeaveRequestRepository leaveRequestRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final StaffLeaveTypeService staffLeaveTypeService;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (leaveRequestRepository.count() > 0) {
            return;
        }
        seedSampleLeaveRequests();
    }

    public List<String> getRoles() {
        return List.of(
                "Super Admin", "Admin", "Teacher", "Faculty", "Technical Head",
                "Principal", "Accountant", "Receptionist", "Librarian"
        );
    }

    public List<String> getLeaveTypes() {
        List<String> types = staffLeaveTypeService.getLeaveTypeNames();
        return types.isEmpty()
                ? List.of("Medical Leave", "Sick Leave", "Casual Leave", "Maternity Leave")
                : types;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return leaveRequestRepository.findAllByOrderByApplyDateDescIdDesc()
                .stream()
                .map(this::toListMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listMyLeaves() {
        StaffMember currentStaff = getCurrentStaffMember();
        return leaveRequestRepository.findByStaffMemberIdOrderByApplyDateDescIdDesc(currentStaff.getId())
                .stream()
                .map(this::toListMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentStaff() {
        StaffMember staff = getCurrentStaffMember();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", staff.getId());
        row.put("staffId", staff.getStaffId());
        row.put("name", fullName(staff));
        row.put("role", primaryRole(staff.getRoles()));
        return row;
    }

    @Transactional
    public Map<String, Object> applyLeave(Map<String, Object> payload, MultipartFile document) {
        StaffMember currentStaff = getCurrentStaffMember();
        payload.put("staffMemberId", currentStaff.getId());
        payload.put("role", primaryRole(currentStaff.getRoles()));
        payload.put("status", "Pending");
        return createLeave(payload, document);
    }

    private StaffMember getCurrentStaffMember() {
        return staffMemberRepository.findByStaffId(DEFAULT_SUBMITTER_STAFF_ID)
                .orElseGet(() -> staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("No staff member found")));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id) {
        StaffLeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));
        return toDetailMap(leave);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStaffByRole(String role) {
        String normalizedRole = role == null ? "" : role.trim();
        List<StaffMember> staffMembers = normalizedRole.isBlank()
                ? staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                : staffMemberRepository.search(normalizedRole, null);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StaffMember staff : staffMembers) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", staff.getId());
            row.put("staffId", staff.getStaffId());
            row.put("name", fullName(staff));
            row.put("role", primaryRole(staff.getRoles()));
            rows.add(row);
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> createLeave(Map<String, Object> payload, MultipartFile document) {
        StaffLeaveRequest leave = buildLeaveFromPayload(new StaffLeaveRequest(), payload, true);
        if (document != null && !document.isEmpty()) {
            leave.setDocumentPath(storeDocument(document));
        }
        applySubmitterMeta(leave);
        return toDetailMap(leaveRequestRepository.save(leave));
    }

    @Transactional
    public Map<String, Object> updateLeave(Long id, Map<String, Object> payload, MultipartFile document) {
        StaffLeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        if (payload.containsKey("status") && payload.size() <= 4) {
            updateApprovalFields(leave, payload);
        } else {
            buildLeaveFromPayload(leave, payload, false);
        }

        if (document != null && !document.isEmpty()) {
            leave.setDocumentPath(storeDocument(document));
        }
        return toDetailMap(leaveRequestRepository.save(leave));
    }

    @Transactional
    public void deleteLeave(Long id) {
        if (!leaveRequestRepository.existsById(id)) {
            throw new IllegalArgumentException("Leave request not found");
        }
        leaveRequestRepository.deleteById(id);
    }

    private void updateApprovalFields(StaffLeaveRequest leave, Map<String, Object> payload) {
        String status = normalizeStatus(text(payload.get("status")));
        leave.setStatus(status);
        if (payload.containsKey("reason")) {
            leave.setReason(text(payload.get("reason")));
        }
        if (payload.containsKey("note")) {
            leave.setNote(text(payload.get("note")));
        }
    }

    private StaffLeaveRequest buildLeaveFromPayload(StaffLeaveRequest leave, Map<String, Object> payload, boolean isCreate) {
        Long staffMemberId = longValue(payload.get("staffMemberId"));
        if (staffMemberId == null) {
            throw new IllegalArgumentException("Staff member is required");
        }

        StaffMember staff = staffMemberRepository.findById(staffMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        leave.setStaffMemberId(staff.getId());
        leave.setStaffName(fullName(staff));
        leave.setStaffIdCode(staff.getStaffId());
        leave.setRole(text(payload.get("role")).isBlank() ? primaryRole(staff.getRoles()) : text(payload.get("role")));

        String leaveType = text(payload.get("leaveType"));
        if (leaveType.isBlank()) {
            throw new IllegalArgumentException("Leave type is required");
        }
        leave.setLeaveType(leaveType);

        String halfDay = text(payload.get("halfDay"));
        leave.setHalfDay(halfDay.isBlank() ? null : halfDay);

        LocalDate applyDate = parseDate(payload.get("applyDate"), "Apply date is required");
        LocalDate fromDate = parseDate(payload.get("fromDate"), "Leave from date is required");
        LocalDate toDate = parseDate(payload.get("toDate"), "Leave to date is required");
        if (toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("Leave to date cannot be before from date");
        }

        leave.setApplyDate(applyDate);
        leave.setFromDate(fromDate);
        leave.setToDate(toDate);
        leave.setDays(calculateDays(fromDate, toDate, halfDay));

        if (payload.containsKey("reason")) {
            leave.setReason(text(payload.get("reason")));
        }
        if (payload.containsKey("note")) {
            leave.setNote(text(payload.get("note")));
        }

        if (payload.containsKey("status")) {
            leave.setStatus(normalizeStatus(text(payload.get("status"))));
        } else if (isCreate) {
            leave.setStatus("Pending");
        }

        return leave;
    }

    private void applySubmitterMeta(StaffLeaveRequest leave) {
        staffMemberRepository.findByStaffId(DEFAULT_SUBMITTER_STAFF_ID).ifPresentOrElse(staff -> {
            leave.setSubmittedByName(fullName(staff));
            leave.setSubmittedByStaffId(staff.getStaffId());
        }, () -> {
            leave.setSubmittedByName(DEFAULT_SUBMITTER_NAME);
            leave.setSubmittedByStaffId(DEFAULT_SUBMITTER_STAFF_ID);
        });
    }

    private BigDecimal calculateDays(LocalDate fromDate, LocalDate toDate, String halfDay) {
        long dayCount = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        if (halfDay != null && !halfDay.isBlank() && fromDate.equals(toDate)) {
            return BigDecimal.valueOf(0.5).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(dayCount).setScale(2, RoundingMode.HALF_UP);
    }

    private Map<String, Object> toListMap(StaffLeaveRequest leave) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", leave.getId());
        row.put("staff", leave.getStaffName() + " (" + leave.getStaffIdCode() + ")");
        row.put("staffName", leave.getStaffName());
        row.put("staffIdCode", leave.getStaffIdCode());
        row.put("leaveType", leave.getLeaveType());
        row.put("halfDay", leave.getHalfDay() != null ? leave.getHalfDay() : "");
        row.put("leaveDate", formatDateRange(leave.getFromDate(), leave.getToDate()));
        row.put("days", formatDays(leave.getDays()));
        row.put("applyDate", formatDate(leave.getApplyDate()));
        row.put("status", leave.getStatus());
        row.put("statusDisplay", leave.getStatus());
        return row;
    }

    private Map<String, Object> toDetailMap(StaffLeaveRequest leave) {
        Map<String, Object> detail = new LinkedHashMap<>(toListMap(leave));
        detail.put("staffMemberId", leave.getStaffMemberId());
        detail.put("role", leave.getRole());
        detail.put("fromDate", formatDate(leave.getFromDate()));
        detail.put("toDate", formatDate(leave.getToDate()));
        detail.put("leaveSummary", formatDateRange(leave.getFromDate(), leave.getToDate())
                + " (" + formatDays(leave.getDays()) + " Days)");
        detail.put("submittedBy", formatSubmittedBy(leave));
        detail.put("reason", leave.getReason() != null ? leave.getReason() : "");
        detail.put("note", leave.getNote() != null ? leave.getNote() : "");
        detail.put("documentPath", leave.getDocumentPath() != null ? leave.getDocumentPath() : "");
        return detail;
    }

    private String formatSubmittedBy(StaffLeaveRequest leave) {
        if (leave.getSubmittedByName() == null || leave.getSubmittedByName().isBlank()) {
            return "";
        }
        if (leave.getSubmittedByStaffId() != null && !leave.getSubmittedByStaffId().isBlank()) {
            return leave.getSubmittedByName() + " (" + leave.getSubmittedByStaffId() + ")";
        }
        return leave.getSubmittedByName();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }
        return switch (status.trim().toLowerCase(Locale.ROOT)) {
            case "approved", "approve" -> "Approved";
            case "disapproved", "disapprove" -> "Disapproved";
            default -> "Pending";
        };
    }

    private void seedSampleLeaveRequests() {
        List<StaffMember> staffMembers = staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        if (staffMembers.isEmpty()) {
            return;
        }

        List<SeedLeave> seeds = List.of(
                seed(staffMembers, 0, "Medical Leave", null, "2026-08-26", "2026-08-30", "2026-08-08", "Disapproved"),
                seed(staffMembers, 1, "Sick Leave", "Second Half", "2026-08-12", "2026-08-12", "2026-08-10", "Pending"),
                seed(staffMembers, 2, "Casual Leave", null, "2026-08-15", "2026-08-16", "2026-08-09", "Approved"),
                seed(staffMembers, 3, "Medical Leave", null, "2026-08-20", "2026-08-22", "2026-08-07", "Pending"),
                seed(staffMembers, 4, "Casual Leave", "First Half", "2026-08-18", "2026-08-18", "2026-08-06", "Approved"),
                seed(staffMembers, 0, "Sick Leave", null, "2026-09-01", "2026-09-03", "2026-08-05", "Pending"),
                seed(staffMembers, 1, "Medical Leave", null, "2026-09-10", "2026-09-12", "2026-08-04", "Disapproved"),
                seed(staffMembers, 2, "Casual Leave", null, "2026-08-25", "2026-08-27", "2026-08-03", "Approved"),
                seed(staffMembers, 3, "Sick Leave", "Second Half", "2026-08-14", "2026-08-14", "2026-08-02", "Pending"),
                seed(staffMembers, 4, "Medical Leave", null, "2026-08-05", "2026-08-07", "2026-08-01", "Approved"),
                seed(staffMembers, 0, "Casual Leave", null, "2026-08-28", "2026-08-29", "2026-07-30", "Pending"),
                seed(staffMembers, 1, "Sick Leave", null, "2026-08-21", "2026-08-23", "2026-07-29", "Disapproved"),
                seed(staffMembers, 2, "Medical Leave", "First Half", "2026-08-11", "2026-08-11", "2026-07-28", "Approved"),
                seed(staffMembers, 3, "Casual Leave", null, "2026-08-19", "2026-08-20", "2026-07-27", "Pending"),
                seed(staffMembers, 4, "Sick Leave", null, "2026-08-06", "2026-08-08", "2026-07-26", "Approved"),
                seed(staffMembers, 0, "Medical Leave", null, "2026-08-13", "2026-08-14", "2026-07-25", "Pending"),
                seed(staffMembers, 1, "Casual Leave", "Second Half", "2026-08-17", "2026-08-17", "2026-07-24", "Disapproved")
        );

        for (SeedLeave seed : seeds) {
            StaffLeaveRequest leave = StaffLeaveRequest.builder()
                    .staffMemberId(seed.staff().getId())
                    .staffName(fullName(seed.staff()))
                    .staffIdCode(seed.staff().getStaffId())
                    .role(primaryRole(seed.staff().getRoles()))
                    .leaveType(seed.leaveType())
                    .halfDay(seed.halfDay())
                    .fromDate(seed.fromDate())
                    .toDate(seed.toDate())
                    .days(calculateDays(seed.fromDate(), seed.toDate(), seed.halfDay()))
                    .applyDate(seed.applyDate())
                    .status(seed.status())
                    .reason("Sample leave request")
                    .note("")
                    .submittedByName(DEFAULT_SUBMITTER_NAME)
                    .submittedByStaffId(DEFAULT_SUBMITTER_STAFF_ID)
                    .build();
            leave.setIsActive(true);
            leaveRequestRepository.save(leave);
        }
    }

    private SeedLeave seed(List<StaffMember> staffMembers, int index, String leaveType, String halfDay,
                           String from, String to, String apply, String status) {
        StaffMember staff = staffMembers.get(index % staffMembers.size());
        return new SeedLeave(
                staff,
                leaveType,
                halfDay,
                LocalDate.parse(from),
                LocalDate.parse(to),
                LocalDate.parse(apply),
                status
        );
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

    private String formatDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null) {
            return "";
        }
        if (fromDate.equals(toDate)) {
            return formatDate(fromDate);
        }
        return formatDate(fromDate) + " - " + formatDate(toDate);
    }

    private String formatDays(BigDecimal days) {
        return days != null ? days.setScale(2, RoundingMode.HALF_UP).toPlainString() : "0.00";
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
        return roles.split(",")[0].trim();
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

    private record SeedLeave(
            StaffMember staff,
            String leaveType,
            String halfDay,
            LocalDate fromDate,
            LocalDate toDate,
            LocalDate applyDate,
            String status
    ) {
    }
}
