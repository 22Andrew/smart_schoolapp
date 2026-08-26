package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class UserPanelFeeService {

    private static final String USER_PANEL_FEE_GROUP = "User Panel Monthly Fees";

    private static final String[][] MONTHLY_FEES = {
            {"April", "apr-month-fees", "2026-04-11"},
            {"May", "may-month-fees", "2026-05-01"},
            {"June", "jun-month-fees", "2026-06-01"},
            {"July", "jul-month-fees", "2026-07-01"},
            {"August", "aug-month-fees", "2026-08-01"},
            {"September", "sep-month-fees", "2026-09-01"},
            {"October", "oct-month-fees", "2026-10-01"},
            {"November", "nov-month-fees", "2026-11-01"},
            {"December", "dec-month-fees", "2026-12-01"},
            {"January", "jan-month-fees", "2027-01-01"},
            {"February", "feb-month-fees", "2027-02-01"},
            {"March", "mar-month-fees", "2027-03-01"}
    };

    private final UserPanelContextService userPanelContextService;
    private final StudentFeeService studentFeeService;
    private final OfflineBankPaymentService offlineBankPaymentService;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final FeeGroupRepository feeGroupRepository;
    private final FeeTypeRepository feeTypeRepository;
    private final FeeMasterRepository feeMasterRepository;
    private final FeeGroupAssignmentRepository assignmentRepository;
    private final FeePaymentRepository feePaymentRepository;

    public UserPanelFeeService(
            UserPanelContextService userPanelContextService,
            StudentFeeService studentFeeService,
            OfflineBankPaymentService offlineBankPaymentService,
            StudentAdmissionRepository studentAdmissionRepository,
            FeeGroupRepository feeGroupRepository,
            FeeTypeRepository feeTypeRepository,
            FeeMasterRepository feeMasterRepository,
            FeeGroupAssignmentRepository assignmentRepository,
            FeePaymentRepository feePaymentRepository
    ) {
        this.userPanelContextService = userPanelContextService;
        this.studentFeeService = studentFeeService;
        this.offlineBankPaymentService = offlineBankPaymentService;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.feeGroupRepository = feeGroupRepository;
        this.feeTypeRepository = feeTypeRepository;
        this.feeMasterRepository = feeMasterRepository;
        this.assignmentRepository = assignmentRepository;
        this.feePaymentRepository = feePaymentRepository;
    }

    @Transactional
    public Map<String, Object> getFeesPage(Authentication authentication, String sessionYear) {
        StudentAdmission student = requireStudent(authentication);
        String session = normalizeSession(sessionYear);
        ensureStudentPanelFeesSeeded(student.getId(), session);
        return studentFeeService.getStudentFeePage(student.getId(), session);
    }

    @Transactional
    public List<FeePayment> collectSelected(Authentication authentication, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(authentication);
        String session = normalizeSession(asString(payload.get("sessionYear")));
        List<Long> feeMasterIds = parseLongList(payload.get("feeMasterIds"));
        return studentFeeService.collectSelected(
                student.getId(),
                session,
                feeMasterIds,
                asString(payload.get("paymentMode")),
                parseDate(payload.get("paymentDate")),
                asString(payload.get("note")),
                parseDouble(payload.get("payingAmount"))
        );
    }

    @Transactional
    public Map<String, Object> submitOfflineBankPayment(Authentication authentication, Map<String, Object> payload) {
        StudentAdmission student = requireStudent(authentication);
        Double amount = parseDouble(payload.get("amount"));
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        return offlineBankPaymentService.createPaymentForStudent(
                student.getId(),
                parseDate(payload.get("paymentDate")),
                amount,
                asString(payload.get("note"))
        );
    }

    @Transactional
    public void ensureStudentPanelFeesSeeded(Long studentId, String sessionYear) {
        studentAdmissionRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Map<String, Object> existing = studentFeeService.getStudentFeePage(studentId, sessionYear);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> feeRows = (List<Map<String, Object>>) existing.get("fees");
        if (feeRows != null && !feeRows.isEmpty()) {
            return;
        }

        FeeGroup feeGroup = feeGroupRepository.findByNameIgnoreCase(USER_PANEL_FEE_GROUP)
                .orElseGet(() -> feeGroupRepository.save(new FeeGroup(
                        USER_PANEL_FEE_GROUP,
                        "Monthly fees for student panel"
                )));

        if (!assignmentRepository.existsByFeeGroupIdAndStudentAdmissionIdAndSessionYear(
                feeGroup.getId(), studentId, sessionYear)) {
            assignmentRepository.save(new FeeGroupAssignment(feeGroup.getId(), studentId, sessionYear));
        }

        List<FeeMaster> masters = new ArrayList<>();
        for (String[] month : MONTHLY_FEES) {
            String typeName = month[0] + " Month Fees";
            String feesCode = month[1];
            LocalDate dueDate = LocalDate.parse(month[2]);

            FeeType feeType = feeTypeRepository.findByFeesCodeIgnoreCase(feesCode)
                    .orElseGet(() -> feeTypeRepository.save(new FeeType(typeName, feesCode, typeName)));

            FeeMaster master = feeMasterRepository
                    .findByFeeGroupIdOrderByIdAsc(feeGroup.getId()).stream()
                    .filter(row -> row.getFeeType() != null
                            && feesCode.equalsIgnoreCase(row.getFeeType().getFeesCode())
                            && sessionYear.equals(row.getSessionYear()))
                    .findFirst()
                    .orElse(null);

            if (master == null) {
                master = new FeeMaster();
                master.setFeeGroup(feeGroup);
                master.setFeeType(feeType);
                master.setSessionYear(sessionYear);
                master.setDueDate(dueDate);
                master.setAmount(350.0);
                master.setFineType(FeeMaster.FineType.NONE);
                master.setFixAmount(0.0);
                if ("may-month-fees".equalsIgnoreCase(feesCode)) {
                    master.setFineType(FeeMaster.FineType.FIX_AMOUNT);
                    master.setFixAmount(50.0);
                }
                master = feeMasterRepository.save(master);
            }
            masters.add(master);
        }

        seedPaymentIfMissing(studentId, sessionYear, masters.get(0), "5458/1", 350.0, LocalDate.of(2026, 4, 1));
        seedPaymentIfMissing(studentId, sessionYear, masters.get(1), "5490/1", 200.0, LocalDate.of(2026, 5, 2));
        seedPaymentIfMissing(studentId, sessionYear, masters.get(3), "5490/2", 350.0, LocalDate.of(2026, 7, 5));
    }

    private void seedPaymentIfMissing(Long studentId,
                                      String sessionYear,
                                      FeeMaster master,
                                      String paymentRef,
                                      double paidAmount,
                                      LocalDate paymentDate) {
        if (feePaymentRepository.findByPaymentRefIgnoreCase(paymentRef).isPresent()) {
            return;
        }
        FeePayment payment = new FeePayment();
        payment.setStudentAdmissionId(studentId);
        payment.setFeeMasterId(master.getId());
        payment.setPaymentRef(paymentRef);
        payment.setSessionYear(sessionYear);
        payment.setPaidAmount(paidAmount);
        payment.setDiscountAmount(0.0);
        payment.setFineAmount(0.0);
        payment.setPaymentMode("Cash");
        payment.setPaymentDate(paymentDate);
        payment.setNote("");
        feePaymentRepository.save(payment);
    }

    private StudentAdmission requireStudent(Authentication authentication) {
        StudentAdmission student = userPanelContextService.resolveStudent(authentication);
        if (student == null || student.getId() == null) {
            throw new IllegalArgumentException("Student not found for this account");
        }
        return student;
    }

    private String normalizeSession(String sessionYear) {
        String session = sessionYear == null ? "" : sessionYear.trim();
        return session.isEmpty() ? FeeMasterService.DEFAULT_SESSION : session;
    }

    private List<Long> parseLongList(Object raw) {
        List<Long> values = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object value : list) {
                if (value != null && !String.valueOf(value).isBlank()) {
                    values.add(Long.valueOf(String.valueOf(value).trim()));
                }
            }
        }
        return values;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Double parseDouble(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid number value");
        }
    }

    private LocalDate parseDate(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        String text = String.valueOf(value).trim();
        try {
            if (text.contains("/")) {
                String[] parts = text.split("/");
                if (parts.length == 3) {
                    return LocalDate.of(
                            Integer.parseInt(parts[2]),
                            Integer.parseInt(parts[0]),
                            Integer.parseInt(parts[1])
                    );
                }
            }
            return LocalDate.parse(text);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid payment date");
        }
    }
}
