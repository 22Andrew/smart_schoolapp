package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OfflineBankPayment;
import com.kantechsolution.smart_school.model.OfflineBankPayment.PaymentStatus;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.OfflineBankPaymentRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OfflineBankPaymentService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy hh:mm a");

    @Autowired
    private OfflineBankPaymentRepository offlineBankPaymentRepository;

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPayments() {
        List<OfflineBankPayment> payments = offlineBankPaymentRepository.findAllByOrderByIdDesc();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (OfflineBankPayment payment : payments) {
            rows.add(toRow(payment));
        }
        return rows;
    }

    @Transactional
    public Map<String, Object> approvePayment(Long id) {
        OfflineBankPayment payment = offlineBankPaymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offline bank payment not found"));
        if (payment.getStatus() == PaymentStatus.APPROVED) {
            throw new IllegalArgumentException("Payment is already approved");
        }

        payment.setStatus(PaymentStatus.APPROVED);
        payment.setStatusDate(LocalDateTime.now());
        if (payment.getPaymentId() == null || payment.getPaymentId().isBlank()) {
            payment.setPaymentId(generatePaymentId(payment.getId()));
        }
        return toRow(offlineBankPaymentRepository.save(payment));
    }

    @Transactional
    public Map<String, Object> createPayment(String admissionNo,
                                             LocalDate paymentDate,
                                             Double amount,
                                             String note) {
        if (admissionNo == null || admissionNo.trim().isEmpty()) {
            throw new IllegalArgumentException("Admission No is required");
        }
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        StudentAdmission student = studentAdmissionRepository.findByAdmissionNoIgnoreCase(admissionNo.trim())
                .orElseThrow(() -> new IllegalArgumentException("Student not found for admission no"));

        OfflineBankPayment payment = new OfflineBankPayment();
        payment.setStudentAdmissionId(student.getId());
        payment.setAdmissionNo(student.getAdmissionNo());
        payment.setStudentName(fullName(student));
        payment.setClassLabel(classLabel(student));
        payment.setPaymentDate(paymentDate != null ? paymentDate : LocalDate.now());
        payment.setSubmitDate(LocalDateTime.now());
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setNote(note);
        return toRow(offlineBankPaymentRepository.save(payment));
    }

    private Map<String, Object> toRow(OfflineBankPayment payment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", payment.getId());
        row.put("requestId", payment.getId());
        row.put("studentAdmissionId", payment.getStudentAdmissionId());
        row.put("admissionNo", payment.getAdmissionNo());
        row.put("studentName", payment.getStudentName());
        row.put("classLabel", payment.getClassLabel());
        row.put("paymentDate", payment.getPaymentDate());
        row.put("paymentDateDisplay", payment.getPaymentDate() == null ? "" : DATE_FMT.format(payment.getPaymentDate()));
        row.put("submitDate", payment.getSubmitDate());
        row.put("submitDateDisplay", payment.getSubmitDate() == null ? "" : DATETIME_FMT.format(payment.getSubmitDate()));
        row.put("amount", payment.getAmount() == null ? 0.0 : payment.getAmount());
        row.put("status", payment.getStatus() == null ? PaymentStatus.PENDING.name() : payment.getStatus().name());
        row.put("statusDate", payment.getStatusDate());
        row.put("statusDateDisplay", payment.getStatusDate() == null ? "" : DATETIME_FMT.format(payment.getStatusDate()));
        row.put("paymentId", payment.getPaymentId() == null ? "" : payment.getPaymentId());
        row.put("note", payment.getNote());
        return row;
    }

    private String generatePaymentId(Long requestId) {
        long base = 1000L + (requestId == null ? 0L : requestId);
        return base + "/1";
    }

    private String fullName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String last = student.getLastName() == null ? "" : student.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isEmpty() ? "Student" : name;
    }

    private String classLabel(StudentAdmission student) {
        String className = student.getSchoolClass() != null ? student.getSchoolClass().getName() : "";
        String section = student.getSection() == null ? "" : student.getSection().trim();
        if (className == null || className.isBlank()) {
            return section;
        }
        return section.isBlank() ? className : className + "(" + section + ")";
    }
}
