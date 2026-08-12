package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StaffPayrollRecord;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StaffPayrollRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffPayrollService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private final StaffMemberRepository staffMemberRepository;
    private final StaffPayrollRecordRepository payrollRecordRepository;

    public List<String> getRoles() {
        return List.of(
                "Super Admin", "Admin", "Teacher", "Faculty", "Technical Head",
                "Principal", "Accountant", "Receptionist", "Librarian"
        );
    }

    public List<Map<String, String>> getMonths() {
        List<Map<String, String>> months = new ArrayList<>();
        for (Month month : Month.values()) {
            Map<String, String> item = new LinkedHashMap<>();
            item.put("value", String.valueOf(month.getValue()));
            item.put("label", month.name().charAt(0) + month.name().substring(1).toLowerCase());
            months.add(item);
        }
        return months;
    }

    @Transactional
    public List<Map<String, Object>> searchStaffPayroll(String role, Integer month, Integer year) {
        if (month == null || year == null) {
            throw new IllegalArgumentException("Month and year are required");
        }

        String normalizedRole = role == null ? "" : role.trim();
        List<StaffMember> staffMembers = normalizedRole.isBlank()
                ? staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                : staffMemberRepository.search(normalizedRole, null);

        List<Long> staffIds = staffMembers.stream().map(StaffMember::getId).toList();
        Map<Long, StaffPayrollRecord> existing = staffIds.isEmpty()
                ? Map.of()
                : payrollRecordRepository.findByPayrollMonthAndPayrollYearAndStaffMemberIdIn(month, year, staffIds)
                        .stream()
                        .collect(Collectors.toMap(StaffPayrollRecord::getStaffMemberId, r -> r, (a, b) -> a));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (StaffMember staff : staffMembers) {
            StaffPayrollRecord record = existing.get(staff.getId());
            if (record == null) {
                record = createDefaultRecord(staff, month, year);
                payrollRecordRepository.save(record);
            }
            rows.add(toListRow(staff, record));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPayrollRecord(Long payrollId) {
        StaffPayrollRecord record = payrollRecordRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        StaffMember staff = staffMemberRepository.findById(record.getStaffMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));
        return toDetailMap(staff, record);
    }

    @Transactional
    public Map<String, Object> savePayrollRecord(Long payrollId, Map<String, Object> payload) {
        StaffPayrollRecord record = payrollRecordRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        StaffMember staff = staffMemberRepository.findById(record.getStaffMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        if (!canEditPayroll(record)) {
            throw new IllegalArgumentException("Edit is only available for reverted or unpaid payroll records.");
        }

        Double basicSalary = doubleValue(payload.get("basicSalary"));
        if (basicSalary != null) {
            record.setBasicSalary(basicSalary);
        }

        List<Map<String, Object>> earnings = readLineItems(payload.get("earnings"));
        List<Map<String, Object>> deductions = readLineItems(payload.get("deductions"));
        record.setEarningsJson(writeJson(earnings));
        record.setDeductionsJson(writeJson(deductions));

        double totalEarning = sumAmounts(earnings);
        double totalDeduction = sumAmounts(deductions);
        double tax = doubleValue(payload.get("tax")) != null ? doubleValue(payload.get("tax")) : 0.0;
        double basic = record.getBasicSalary() != null ? record.getBasicSalary() : 0.0;
        double gross = basic + totalEarning;
        double net = gross - totalDeduction - tax;

        record.setTotalEarning(totalEarning);
        record.setTotalDeduction(totalDeduction);
        record.setTax(tax);
        record.setGrossSalary(gross);
        record.setNetSalary(net);
        record.setStatus("Paid");
        record.setReverted(false);
        if (payload.get("paymentMode") != null) {
            record.setPaymentMode(text(payload.get("paymentMode")));
        }
        if (record.getPaymentDate() == null) {
            record.setPaymentDate(LocalDate.now());
        }

        payrollRecordRepository.save(record);
        return toDetailMap(staff, record);
    }

    @Transactional
    public Map<String, Object> processPayrollRecord(Long payrollId, Map<String, Object> payload) {
        StaffPayrollRecord record = payrollRecordRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        StaffMember staff = staffMemberRepository.findById(record.getStaffMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        String status = record.getStatus() != null ? record.getStatus().trim() : "";
        if (!"Generated".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Only Generated payroll records can be processed to pay.");
        }

        Map<String, Object> body = payload != null ? payload : Map.of();
        String paymentMode = text(body.get("paymentMode"));
        if (paymentMode.isBlank()) {
            throw new IllegalArgumentException("Payment mode is required");
        }

        LocalDate paymentDate = parsePaymentDate(text(body.get("paymentDate")));
        if (paymentDate == null) {
            throw new IllegalArgumentException("Payment date is required");
        }

        Double paymentAmount = doubleValue(body.get("paymentAmount"));
        if (paymentAmount != null && paymentAmount >= 0) {
            record.setNetSalary(paymentAmount);
        }

        record.setStatus("Paid");
        record.setReverted(false);
        record.setPaymentMode(paymentMode);
        record.setPaymentDate(paymentDate);
        record.setPaymentNote(text(body.get("note")));
        payrollRecordRepository.save(record);
        return toDetailMap(staff, record);
    }

    @Transactional
    public Map<String, Object> revertPayrollRecord(Long payrollId) {
        StaffPayrollRecord record = payrollRecordRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll record not found"));
        StaffMember staff = staffMemberRepository.findById(record.getStaffMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));
        applyDefaultPayrollValues(record, staff);
        record.setStatus("Generated");
        record.setReverted(true);
        payrollRecordRepository.save(record);
        return toDetailMap(staff, record);
    }

    private StaffPayrollRecord createDefaultRecord(StaffMember staff, Integer month, Integer year) {
        StaffPayrollRecord record = StaffPayrollRecord.builder()
                .staffMemberId(staff.getId())
                .payrollMonth(month)
                .payrollYear(year)
                .payslipNo(String.valueOf(500 + staff.getId()))
                .build();
        applyDefaultPayrollValues(record, staff);
        return record;
    }

    private void applyDefaultPayrollValues(StaffPayrollRecord record, StaffMember staff) {
        double basicSalary = parseBasicSalary(staff.getBasicSalary());
        if (basicSalary <= 0) {
            basicSalary = 45000.0;
        }

        List<Map<String, Object>> defaultEarnings = List.of(
                Map.of("type", String.valueOf((int) basicSalary), "amount", 0.0)
        );
        List<Map<String, Object>> defaultDeductions = List.of(
                Map.of("type", "", "amount", 0.0)
        );

        record.setStatus("Paid");
        record.setReverted(false);
        record.setPaymentDate(LocalDate.now());
        record.setPaymentMode("Cash");
        record.setBasicSalary(basicSalary);
        record.setTotalEarning(0.0);
        record.setTotalDeduction(0.0);
        record.setTax(0.0);
        record.setGrossSalary(basicSalary);
        record.setNetSalary(basicSalary);
        record.setEarningsJson(writeJson(defaultEarnings));
        record.setDeductionsJson(writeJson(defaultDeductions));
    }

    private Map<String, Object> toListRow(StaffMember staff, StaffPayrollRecord record) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("payrollId", record.getId());
        row.put("staffMemberId", staff.getId());
        row.put("staffId", staff.getStaffId() != null ? staff.getStaffId() : "");
        row.put("staffName", fullName(staff));
        row.put("role", primaryRole(staff.getRoles()));
        row.put("department", staff.getDepartment() != null ? staff.getDepartment() : "");
        row.put("designation", staff.getDesignation() != null ? staff.getDesignation() : "");
        row.put("phone", staff.getPhone() != null ? staff.getPhone() : "");
        row.put("status", record.getStatus() != null ? record.getStatus() : "Paid");
        row.put("reverted", Boolean.TRUE.equals(record.getReverted()));
        row.put("canEdit", canEditPayroll(record));
        row.put("month", record.getPayrollMonth());
        row.put("year", record.getPayrollYear());
        row.put("monthLabel", monthLabel(record.getPayrollMonth()));
        return row;
    }

    private Map<String, Object> toDetailMap(StaffMember staff, StaffPayrollRecord record) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("payrollId", record.getId());
        detail.put("staffMemberId", staff.getId());
        detail.put("staffId", staff.getStaffId() != null ? staff.getStaffId() : "");
        detail.put("staffName", fullName(staff));
        detail.put("role", primaryRole(staff.getRoles()));
        detail.put("department", staff.getDepartment() != null ? staff.getDepartment() : "");
        detail.put("designation", staff.getDesignation() != null ? staff.getDesignation() : "");
        detail.put("phone", staff.getPhone() != null ? staff.getPhone() : "");
        detail.put("email", staff.getEmail() != null ? staff.getEmail() : "");
        detail.put("epfNo", staff.getEpfNo() != null ? staff.getEpfNo() : "");
        detail.put("photoPath", staff.getPhotoPath() != null ? staff.getPhotoPath() : "");
        detail.put("month", record.getPayrollMonth());
        detail.put("year", record.getPayrollYear());
        detail.put("monthLabel", monthLabel(record.getPayrollMonth()));
        detail.put("monthYear", monthLabel(record.getPayrollMonth()) + " " + record.getPayrollYear());
        detail.put("payslipNo", record.getPayslipNo());
        detail.put("status", record.getStatus());
        detail.put("reverted", Boolean.TRUE.equals(record.getReverted()));
        detail.put("canEdit", canEditPayroll(record));
        detail.put("paymentDate", record.getPaymentDate() != null ? record.getPaymentDate().format(US_DATE) : "");
        detail.put("paymentMode", record.getPaymentMode() != null ? record.getPaymentMode() : "Cash");
        detail.put("paymentNote", record.getPaymentNote() != null ? record.getPaymentNote() : "");
        detail.put("basicSalary", record.getBasicSalary());
        detail.put("totalEarning", record.getTotalEarning());
        detail.put("totalDeduction", record.getTotalDeduction());
        detail.put("tax", record.getTax());
        detail.put("grossSalary", record.getGrossSalary());
        detail.put("netSalary", record.getNetSalary());
        detail.put("earnings", readJson(record.getEarningsJson()));
        detail.put("deductions", readJson(record.getDeductionsJson()));
        detail.put("attendanceSummary", buildAttendanceSummary(record.getPayrollMonth(), record.getPayrollYear()));
        return detail;
    }

    private List<Map<String, Object>> buildAttendanceSummary(Integer month, Integer year) {
        List<Map<String, Object>> summary = new ArrayList<>();
        int baseMonth = month != null ? month : LocalDate.now().getMonthValue();
        int baseYear = year != null ? year : LocalDate.now().getYear();

        for (int offset = 0; offset < 3; offset++) {
            LocalDate date = LocalDate.of(baseYear, baseMonth, 1).minusMonths(offset);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", monthLabel(date.getMonthValue()));
            row.put("P", 22 - offset);
            row.put("L", offset);
            row.put("A", offset);
            row.put("F", 0);
            row.put("H", 1);
            row.put("SH", 4);
            row.put("V", 0);
            summary.add(row);
        }
        return summary;
    }

    private List<Map<String, Object>> readLineItems(Object value) {
        if (value instanceof List<?> list) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("type", text(map.get("type")));
                    row.put("amount", doubleValue(map.get("amount")) != null ? doubleValue(map.get("amount")) : 0.0);
                    items.add(row);
                }
            }
            return items.isEmpty() ? defaultLineItems(true) : items;
        }
        return defaultLineItems(true);
    }

    private List<Map<String, Object>> defaultLineItems(boolean earning) {
        if (earning) {
            return new ArrayList<>(List.of(Map.of("type", "20000", "amount", 0.0)));
        }
        return new ArrayList<>(List.of(Map.of("type", "", "amount", 0.0)));
    }

    private List<Map<String, Object>> readJson(String json) {
        if (json == null || json.isBlank()) {
            return defaultLineItems(true);
        }
        String trimmed = json.trim();
        if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
            return defaultLineItems(true);
        }

        List<Map<String, Object>> items = new ArrayList<>();
        int index = 1;
        while (index < trimmed.length() - 1) {
            int start = trimmed.indexOf('{', index);
            if (start < 0) {
                break;
            }
            int end = trimmed.indexOf('}', start);
            if (end < 0) {
                break;
            }
            items.add(parseLineItemObject(trimmed.substring(start + 1, end)));
            index = end + 1;
        }
        return items.isEmpty() ? defaultLineItems(true) : items;
    }

    private Map<String, Object> parseLineItemObject(String object) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("type", extractJsonString(object, "type"));
        Double amount = extractJsonNumber(object, "amount");
        row.put("amount", amount != null ? amount : 0.0);
        return row;
    }

    private String extractJsonString(String object, String key) {
        String marker = "\"" + key + "\":\"";
        int start = object.indexOf(marker);
        if (start < 0) {
            return "";
        }
        start += marker.length();
        StringBuilder value = new StringBuilder();
        for (int i = start; i < object.length(); i++) {
            char current = object.charAt(i);
            if (current == '\\' && i + 1 < object.length()) {
                value.append(object.charAt(i + 1));
                i++;
                continue;
            }
            if (current == '"') {
                break;
            }
            value.append(current);
        }
        return value.toString();
    }

    private Double extractJsonNumber(String object, String key) {
        String marker = "\"" + key + "\":";
        int start = object.indexOf(marker);
        if (start < 0) {
            return 0.0;
        }
        start += marker.length();
        int end = start;
        while (end < object.length() && "0123456789.-".indexOf(object.charAt(end)) >= 0) {
            end++;
        }
        try {
            return Double.parseDouble(object.substring(start, end).trim());
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }

    private String writeJson(List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) {
            return "[]";
        }
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < items.size(); i++) {
            Map<String, Object> item = items.get(i);
            if (i > 0) {
                json.append(',');
            }
            Double amount = doubleValue(item.get("amount"));
            json.append("{\"type\":\"").append(escapeJson(text(item.get("type")))).append("\",\"amount\":")
                    .append(amount != null ? amount : 0.0).append('}');
        }
        json.append(']');
        return json.toString();
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
    private double sumAmounts(List<Map<String, Object>> items) {
        return items.stream()
                .map(item -> doubleValue(item.get("amount")))
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private boolean canEditPayroll(StaffPayrollRecord record) {
        if (Boolean.TRUE.equals(record.getReverted())) {
            return true;
        }
        String status = record.getStatus() != null ? record.getStatus().trim() : "Paid";
        return !"Paid".equalsIgnoreCase(status);
    }

    private double parseBasicSalary(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }
        String cleaned = value.replaceAll("[^0-9.]", "");
        if (cleaned.isBlank()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }

    private String monthLabel(Integer month) {
        if (month == null || month < 1 || month > 12) {
            return "";
        }
        return Month.of(month).name().charAt(0) + Month.of(month).name().substring(1).toLowerCase();
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

    private LocalDate parsePaymentDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        try {
            if (trimmed.contains("/")) {
                return LocalDate.parse(trimmed, US_DATE);
            }
            return LocalDate.parse(trimmed);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private Double doubleValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
