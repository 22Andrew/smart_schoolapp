package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeGroupAssignment;
import com.kantechsolution.smart_school.model.FeeMaster;
import com.kantechsolution.smart_school.model.FeePayment;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.FeeGroupAssignmentRepository;
import com.kantechsolution.smart_school.repository.FeeMasterRepository;
import com.kantechsolution.smart_school.repository.FeePaymentRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentFeeService {

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    @Autowired
    private FeeGroupAssignmentRepository assignmentRepository;

    @Autowired
    private FeeMasterRepository feeMasterRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    public Map<String, Object> getStudentFeePage(Long studentAdmissionId, String sessionYear) {
        StudentAdmission student = studentAdmissionRepository.findById(studentAdmissionId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        String session = normalizeSession(sessionYear);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("student", toStudentMap(student));
        result.put("sessionYear", session);
        result.put("date", LocalDate.now().toString());
        result.put("fees", buildFeeRows(studentAdmissionId, session));
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPayments(String paymentId) {
        String ref = paymentId == null ? "" : paymentId.trim();
        if (ref.isEmpty()) {
            throw new IllegalArgumentException("Payment ID is required");
        }

        List<FeePayment> payments = feePaymentRepository.findByPaymentRefContainingIgnoreCaseOrderByIdDesc(ref);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (FeePayment payment : payments) {
            rows.add(toPaymentSearchRow(payment));
        }
        return rows;
    }

    private Map<String, Object> toPaymentSearchRow(FeePayment payment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", payment.getId());
        row.put("paymentRef", payment.getPaymentRef());
        row.put("paymentDate", payment.getPaymentDate());
        row.put("paymentMode", payment.getPaymentMode());
        row.put("paidAmount", nz(payment.getPaidAmount()));
        row.put("discountAmount", nz(payment.getDiscountAmount()));
        row.put("fineAmount", nz(payment.getFineAmount()));
        row.put("note", payment.getNote());
        row.put("sessionYear", payment.getSessionYear());
        row.put("studentAdmissionId", payment.getStudentAdmissionId());
        row.put("feeMasterId", payment.getFeeMasterId());

        studentAdmissionRepository.findById(payment.getStudentAdmissionId()).ifPresent(student -> {
            row.put("studentName", fullName(student));
            row.put("admissionNo", student.getAdmissionNo());
            String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "";
            String section = student.getSection() == null ? "" : student.getSection();
            row.put("classSection", className + (section.isBlank() ? "" : " (" + section + ")"));
        });

        feeMasterRepository.findById(payment.getFeeMasterId()).ifPresent(master -> {
            String feeName = master.getFeeType() != null ? master.getFeeType().getName() : "Fees";
            String feesCode = master.getFeeType() != null ? master.getFeeType().getFeesCode() : "";
            String groupName = master.getFeeGroup() != null ? master.getFeeGroup().getName() : "";
            row.put("feesLabel", feeName + " (" + feesCode + ")");
            row.put("feeGroupName", groupName);
        });

        return row;
    }

    @Transactional
    public FeePayment collectSingle(Long studentAdmissionId,
                                    String sessionYear,
                                    Long feeMasterId,
                                    Double payingAmount,
                                    Double discountAmount,
                                    Double fineAmount,
                                    String paymentMode,
                                    LocalDate paymentDate,
                                    String note) {
        StudentAdmission student = studentAdmissionRepository.findById(studentAdmissionId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        String session = normalizeSession(sessionYear);
        if (feeMasterId == null) {
            throw new IllegalArgumentException("Fee is required");
        }

        Map<String, Object> row = null;
        for (Map<String, Object> feeRow : buildFeeRows(student.getId(), session)) {
            if (feeMasterId.equals(feeRow.get("feeMasterId"))) {
                row = feeRow;
                break;
            }
        }
        if (row == null) {
            throw new IllegalArgumentException("Selected fee not found for this student");
        }

        double balance = asDouble(row.get("balance"));
        double pay = payingAmount == null ? 0.0 : payingAmount;
        double discount = discountAmount == null ? 0.0 : discountAmount;
        double fine = fineAmount == null ? 0.0 : fineAmount;
        if (pay < 0 || discount < 0 || fine < 0) {
            throw new IllegalArgumentException("Payment values cannot be negative");
        }
        if (pay <= 0 && discount <= 0) {
            throw new IllegalArgumentException("Paying amount is required");
        }
        if (pay + discount > balance + 0.0001 && balance > 0) {
            // Allow paying remaining balance with optional fine separately
            if (pay > balance && discount <= 0) {
                // still allow partial overpay clamp
            }
        }

        FeePayment payment = new FeePayment();
        payment.setStudentAdmissionId(student.getId());
        payment.setFeeMasterId(feeMasterId);
        payment.setSessionYear(session);
        payment.setPaidAmount(pay);
        payment.setDiscountAmount(discount);
        payment.setFineAmount(fine);
        payment.setPaymentMode(paymentMode == null || paymentMode.isBlank() ? "Cash" : paymentMode.trim());
        payment.setPaymentDate(paymentDate == null ? LocalDate.now() : paymentDate);
        payment.setNote(note == null ? "" : note.trim());
        payment.setPaymentRef(generatePaymentRef());
        return feePaymentRepository.save(payment);
    }

    @Transactional
    public List<FeePayment> collectSelected(Long studentAdmissionId,
                                            String sessionYear,
                                            List<Long> feeMasterIds,
                                            String paymentMode,
                                            LocalDate paymentDate,
                                            String note,
                                            Double payingAmount) {
        StudentAdmission student = studentAdmissionRepository.findById(studentAdmissionId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        String session = normalizeSession(sessionYear);
        if (feeMasterIds == null || feeMasterIds.isEmpty()) {
            throw new IllegalArgumentException("Please select at least one fee");
        }

        String mode = paymentMode == null || paymentMode.isBlank() ? "Cash" : paymentMode.trim();
        LocalDate date = paymentDate == null ? LocalDate.now() : paymentDate;
        String paymentNote = note == null ? "" : note.trim();
        List<Map<String, Object>> feeRows = buildFeeRows(student.getId(), session);
        Map<Long, Map<String, Object>> byMaster = new HashMap<>();
        for (Map<String, Object> row : feeRows) {
            byMaster.put((Long) row.get("feeMasterId"), row);
        }

        double remainingPay = payingAmount == null ? -1 : payingAmount;
        if (payingAmount != null && payingAmount <= 0) {
            throw new IllegalArgumentException("Paying amount is required");
        }

        List<FeePayment> saved = new ArrayList<>();
        for (Long feeMasterId : feeMasterIds) {
            Map<String, Object> row = byMaster.get(feeMasterId);
            if (row == null) {
                continue;
            }
            double balance = asDouble(row.get("balance"));
            if (balance <= 0) {
                continue;
            }

            double payForThis = balance;
            if (remainingPay >= 0) {
                if (remainingPay <= 0) {
                    break;
                }
                payForThis = Math.min(balance, remainingPay);
                remainingPay -= payForThis;
            }

            FeePayment payment = new FeePayment();
            payment.setStudentAdmissionId(student.getId());
            payment.setFeeMasterId(feeMasterId);
            payment.setSessionYear(session);
            payment.setPaidAmount(payForThis);
            payment.setDiscountAmount(0.0);
            payment.setFineAmount(0.0);
            payment.setPaymentMode(mode);
            payment.setPaymentDate(date);
            payment.setNote(paymentNote);
            payment.setPaymentRef(generatePaymentRef());
            saved.add(feePaymentRepository.save(payment));
        }

        if (saved.isEmpty()) {
            throw new IllegalArgumentException("No unpaid balance found for selected fees");
        }
        return saved;
    }

    @Transactional
    public void reversePayment(Long studentAdmissionId, Long paymentId) {
        FeePayment payment = feePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if (!payment.getStudentAdmissionId().equals(studentAdmissionId)) {
            throw new IllegalArgumentException("Payment does not belong to this student");
        }
        feePaymentRepository.delete(payment);
    }

    private List<Map<String, Object>> buildFeeRows(Long studentAdmissionId, String session) {
        List<FeeGroupAssignment> assignments =
                assignmentRepository.findByStudentAdmissionIdAndSessionYear(studentAdmissionId, session);
        List<FeePayment> payments =
                feePaymentRepository.findByStudentAdmissionIdAndSessionYearOrderByIdAsc(studentAdmissionId, session);

        Map<Long, List<FeePayment>> paymentsByMaster = new HashMap<>();
        for (FeePayment payment : payments) {
            paymentsByMaster.computeIfAbsent(payment.getFeeMasterId(), k -> new ArrayList<>()).add(payment);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (FeeGroupAssignment assignment : assignments) {
            List<FeeMaster> masters = feeMasterRepository.findByFeeGroupIdOrderByIdAsc(assignment.getFeeGroupId());
            for (FeeMaster master : masters) {
                if (!session.equals(master.getSessionYear())) {
                    continue;
                }
                List<FeePayment> masterPayments = paymentsByMaster.getOrDefault(master.getId(), List.of());
                rows.add(toFeeRow(master, masterPayments));
            }
        }
        return rows;
    }

    private Map<String, Object> toFeeRow(FeeMaster master, List<FeePayment> payments) {
        double amount = master.getAmount() == null ? 0.0 : master.getAmount();
        double fineConfigured = master.getFixAmount() == null ? 0.0 : master.getFixAmount();
        // Show fine only when fine type is not NONE and unpaid/partial (display amount + fine style)
        boolean hasFineType = master.getFineType() != null
                && master.getFineType() != FeeMaster.FineType.NONE;

        double paid = 0.0;
        double discount = 0.0;
        double finePaid = 0.0;
        List<Map<String, Object>> paymentRows = new ArrayList<>();
        for (FeePayment payment : payments) {
            paid += nz(payment.getPaidAmount());
            discount += nz(payment.getDiscountAmount());
            finePaid += nz(payment.getFineAmount());
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("id", payment.getId());
            p.put("paymentRef", payment.getPaymentRef());
            p.put("paymentMode", payment.getPaymentMode());
            p.put("paymentDate", payment.getPaymentDate());
            p.put("discountAmount", nz(payment.getDiscountAmount()));
            p.put("fineAmount", nz(payment.getFineAmount()));
            p.put("paidAmount", nz(payment.getPaidAmount()));
            paymentRows.add(p);
        }

        double displayFine = finePaid > 0 ? finePaid : 0.0;
        // Balance is against base fee amount only; fine is tracked separately
        double balance = Math.max(0.0, amount - paid - discount);

        String status;
        if (paid <= 0 && discount <= 0) {
            status = "Unpaid";
        } else if (balance <= 0.0001) {
            status = "Paid";
            balance = 0.0;
        } else {
            status = "Partial";
        }

        String feeName = master.getFeeType() != null ? master.getFeeType().getName() : "Fees";
        String feesCode = master.getFeeType() != null ? master.getFeeType().getFeesCode() : "";
        String groupName = master.getFeeGroup() != null ? master.getFeeGroup().getName() : "";
        String modalTitle = groupName
                + " (" + feeName + ")"
                + (feesCode.isBlank() ? "" : ": " + feesCode);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("feeMasterId", master.getId());
        row.put("feesLabel", feeName + " (" + feesCode + ")");
        row.put("modalTitle", modalTitle);
        row.put("feeGroupName", groupName);
        row.put("feeTypeName", feeName);
        row.put("feesCode", feesCode);
        row.put("dueDate", master.getDueDate());
        row.put("status", status);
        row.put("amount", amount);
        row.put("amountExtra", hasFineType && "Unpaid".equals(status) ? fineConfigured : 0.0);
        row.put("configuredFine", hasFineType ? fineConfigured : 0.0);
        row.put("discount", discount);
        row.put("fine", displayFine > 0 ? displayFine : ("Unpaid".equals(status) && hasFineType ? fineConfigured : 0.0));
        row.put("paid", paid);
        row.put("balance", balance);
        row.put("payments", paymentRows);
        return row;
    }

    private Map<String, Object> toStudentMap(StudentAdmission student) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", student.getId());
        map.put("name", fullName(student));
        map.put("fatherName", student.getFatherName());
        map.put("mobileNumber", student.getMobileNumber());
        map.put("categoryName", student.getCategory() != null ? student.getCategory().getCategoryName() : "");
        String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "";
        String section = student.getSection() == null ? "" : student.getSection();
        map.put("classSection", className + (section.isBlank() ? "" : " (" + section + ")"));
        map.put("admissionNo", student.getAdmissionNo());
        map.put("rollNumber", student.getRollNumber());
        map.put("rte", student.getRte() == null || student.getRte().isBlank() ? "No" : student.getRte());
        map.put("photoUrl", student.getPhotoPath());
        return map;
    }

    private String generatePaymentRef() {
        return "TRX" + System.currentTimeMillis();
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String last = student.getLastName() == null ? "" : student.getLastName().trim();
        return (first + " " + last).trim();
    }

    private String normalizeSession(String sessionYear) {
        String session = sessionYear == null ? "" : sessionYear.trim();
        return session.isEmpty() ? FeeMasterService.DEFAULT_SESSION : session;
    }

    private double nz(Double value) {
        return value == null ? 0.0 : value;
    }

    private double asDouble(Object value) {
        if (value == null) return 0.0;
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception e) {
            return 0.0;
        }
    }
}
