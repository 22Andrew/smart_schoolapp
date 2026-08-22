package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.report.ReportCategoryDefinition;
import com.kantechsolution.smart_school.report.ReportDefinition;
import com.kantechsolution.smart_school.report.ReportModuleCatalog;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportModuleService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private StudentAdmissionRepository studentAdmissionRepository;

    @Autowired
    private StudentSiblingRepository studentSiblingRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private StudentAttendanceEntryRepository studentAttendanceEntryRepository;

    @Autowired
    private StaffAttendanceEntryRepository staffAttendanceEntryRepository;

    @Autowired
    private StaffMemberRepository staffMemberRepository;

    @Autowired
    private StaffLeaveRequestRepository staffLeaveRequestRepository;

    @Autowired
    private StaffPayrollRecordRepository staffPayrollRecordRepository;

    @Autowired
    private HomeworkRepository homeworkRepository;

    @Autowired
    private LibraryBookIssueRepository libraryBookIssueRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private TransportRouteRepository transportRouteRepository;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private AlumniEventRepository alumniEventRepository;

    @Autowired
    private AppUserAccountRepository appUserAccountRepository;

    @Autowired
    private OnlineExamRepository onlineExamRepository;

    @Autowired
    private OnlineExamStudentRepository onlineExamStudentRepository;

    @Autowired
    private LessonPlanLessonRepository lessonPlanLessonRepository;

    @Autowired
    private ExamResultRecordRepository examResultRecordRepository;

    public Optional<ReportCategoryDefinition> findCategory(String categorySlug) {
        return ReportModuleCatalog.findCategory(categorySlug);
    }

    public List<Map<String, Object>> runReport(String categorySlug,
                                               String reportKey,
                                               Long classId,
                                               String section,
                                               LocalDate dateFrom,
                                               LocalDate dateTo,
                                               Long categoryId,
                                               String gender,
                                               String rte,
                                               String role,
                                               Integer month,
                                               Integer year,
                                               String source,
                                               Long examId,
                                               String searchType,
                                               String dateType,
                                               String searchDuration,
                                               Long studentId,
                                               String incomeHead,
                                               String expenseHead,
                                               Long feeTypeId,
                                               String collectBy,
                                               String groupBy) {
        ReportCategoryDefinition category = ReportModuleCatalog.findCategory(categorySlug)
                .orElseThrow(() -> new IllegalArgumentException("Unknown report category"));
        ReportDefinition report = category.findReport(reportKey);
        if (report == null) {
            throw new IllegalArgumentException("Unknown report type");
        }

        return switch (categorySlug.toLowerCase()) {
            case "studentinformation" -> studentInformationReport(
                    reportKey, classId, section, dateFrom, dateTo, categoryId, gender, rte);
            case "finance" -> financeReport(reportKey, classId, section, dateFrom, dateTo, searchType, searchDuration,
                    studentId, incomeHead, expenseHead, feeTypeId, collectBy, groupBy);
            case "attendance" -> attendanceReport(reportKey, classId, section, dateFrom, dateTo, role, month, year, source);
            case "examinations" -> examinationReport(reportKey, classId, section);
            case "onlineexaminations" -> onlineExaminationReport(reportKey, examId, classId, section, searchType, dateType);
            case "lessonplan" -> lessonPlanReport(reportKey, classId, section, dateFrom, dateTo);
            case "humanresource" -> humanResourceReport(reportKey, dateFrom, dateTo);
            case "homework" -> homeworkReport(reportKey, classId, section, dateFrom, dateTo);
            case "library" -> libraryReport(reportKey, dateFrom, dateTo);
            case "inventory" -> inventoryReport(reportKey, dateFrom, dateTo);
            case "transport" -> transportReport(reportKey, classId, section);
            case "hostel" -> hostelReport(reportKey);
            case "alumni" -> alumniReport(reportKey, dateFrom, dateTo);
            case "userlog" -> userLogReport(dateFrom, dateTo);
            case "audittrail" -> auditTrailReport(dateFrom, dateTo);
            default -> List.of();
        };
    }

    private List<StudentAdmission> loadStudents(Long classId, String section,
                                                Long categoryId, String gender, String rte) {
        return studentAdmissionRepository.search(classId, section, null, false, null).stream()
                .filter(student -> categoryId == null || (student.getCategory() != null
                        && Objects.equals(student.getCategory().getId(), categoryId)))
                .filter(student -> gender == null || gender.isBlank()
                        || gender.equalsIgnoreCase(text(student.getGender())))
                .filter(student -> matchesRte(student, rte))
                .collect(Collectors.toList());
    }

    private boolean matchesRte(StudentAdmission student, String rte) {
        if (rte == null || rte.isBlank()) {
            return true;
        }
        String studentRte = text(student.getRte());
        if ("Yes".equalsIgnoreCase(rte)) {
            return "Yes".equalsIgnoreCase(studentRte);
        }
        if ("No".equalsIgnoreCase(rte)) {
            return studentRte.isBlank() || "No".equalsIgnoreCase(studentRte);
        }
        return true;
    }

    private Map<String, Object> baseStudentRow(StudentAdmission student) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", student.getId());
        row.put("admissionNo", text(student.getAdmissionNo()));
        row.put("rollNumber", text(student.getRollNumber()));
        row.put("firstName", text(student.getFirstName()));
        row.put("lastName", text(student.getLastName()));
        row.put("name", studentFullName(student));
        row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
        row.put("section", text(student.getSection()));
        row.put("gender", text(student.getGender()));
        row.put("mobileNumber", text(student.getMobileNumber()));
        row.put("email", text(student.getEmail()));
        row.put("dateOfBirth", formatDate(student.getDateOfBirth()));
        row.put("admissionDate", formatDate(student.getAdmissionDate()));
        row.put("category", student.getCategory() != null ? text(student.getCategory().getCategoryName()) : "");
        row.put("religion", text(student.getReligion()));
        row.put("bloodGroup", text(student.getBloodGroup()));
        row.put("currentAddress", text(student.getCurrentAddress()));
        row.put("guardianName", text(student.getGuardianName()));
        row.put("guardianPhone", text(student.getGuardianPhone()));
        row.put("guardianEmail", text(student.getGuardianEmail()));
        row.put("guardianRelation", text(student.getGuardianRelation()));
        row.put("fatherName", text(student.getFatherName()));
        row.put("motherName", text(student.getMotherName()));
        row.put("createdAt", student.getCreatedAt() != null ? student.getCreatedAt().toLocalDate().format(DATE_FMT) : "");
        return row;
    }

    private List<Map<String, Object>> studentInformationReport(String reportKey,
                                                               Long classId,
                                                               String section,
                                                               LocalDate dateFrom,
                                                               LocalDate dateTo,
                                                               Long categoryId,
                                                               String gender,
                                                               String rte) {
        return switch (reportKey.toLowerCase()) {
            case "studentreport" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .map(this::baseStudentRow)
                    .collect(Collectors.toList());
            case "studentprofile" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("permanentAddress", text(student.getPermanentAddress()));
                        row.put("nationalId", text(student.getNationalId()));
                        row.put("localId", text(student.getLocalId()));
                        row.put("rte", text(student.getRte()));
                        row.put("previousSchoolDetails", text(student.getPreviousSchoolDetails()));
                        return row;
                    })
                    .collect(Collectors.toList());
            case "admissionreport" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .filter(student -> inDateRange(student.getAdmissionDate(), dateFrom, dateTo))
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("referenceNo", text(student.getReferenceNo()));
                        row.put("onlineAdmission", student.isOnlineAdmission() ? "Yes" : "No");
                        return row;
                    })
                    .collect(Collectors.toList());
            case "studentlogincredential" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        String username = text(student.getAdmissionNo()).toLowerCase(Locale.ROOT);
                        row.put("username", username);
                        row.put("password", "******");
                        row.put("loginEnabled", "Yes");
                        return row;
                    })
                    .collect(Collectors.toList());
            case "studenthistory" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("historyDate", formatDate(student.getAdmissionDate()));
                        row.put("action", "Admission");
                        row.put("description", "Student admitted to " + row.get("className") + " (" + row.get("section") + ")");
                        return row;
                    })
                    .collect(Collectors.toList());
            case "guardianreport" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .map(student -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("admissionNo", text(student.getAdmissionNo()));
                        row.put("name", studentFullName(student));
                        row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
                        row.put("section", text(student.getSection()));
                        row.put("guardianName", text(student.getGuardianName()));
                        row.put("guardianRelation", text(student.getGuardianRelation()));
                        row.put("guardianPhone", text(student.getGuardianPhone()));
                        row.put("guardianEmail", text(student.getGuardianEmail()));
                        row.put("guardianAddress", text(student.getGuardianAddress()));
                        return row;
                    })
                    .collect(Collectors.toList());
            case "classsubjectreport" -> loadStudents(classId, section, categoryId, gender, rte).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("subjects", "All Subjects");
                        return row;
                    })
                    .collect(Collectors.toList());
            case "siblingreport" -> studentSiblingRepository.findAll().stream()
                    .map(sibling -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        studentAdmissionRepository.findById(sibling.getStudentAdmissionId()).ifPresent(student -> {
                            row.put("studentName", studentFullName(student));
                            row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
                            row.put("section", text(student.getSection()));
                        });
                        studentAdmissionRepository.findById(sibling.getSiblingAdmissionId()).ifPresent(siblingStudent -> {
                            row.put("siblingName", studentFullName(siblingStudent));
                            row.put("siblingClass", siblingStudent.getSchoolClass() != null
                                    ? text(siblingStudent.getSchoolClass().getName()) : "");
                            row.put("siblingSection", text(siblingStudent.getSection()));
                        });
                        return row;
                    })
                    .collect(Collectors.toList());
            case "studentgenderatio" -> genderRatioReport();
            case "studentteacherratio" -> studentTeacherRatioReport();
            default -> List.of();
        };
    }

    private List<Map<String, Object>> genderRatioReport() {
        List<StudentAdmission> students = studentAdmissionRepository.search(null, null, null, false, null);
        Map<String, Long> counts = students.stream()
                .collect(Collectors.groupingBy(
                        student -> text(student.getGender()).isBlank() ? "Unknown" : text(student.getGender()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        List<Map<String, Object>> rows = new ArrayList<>();
        long total = students.size();
        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("gender", entry.getKey());
            row.put("totalStudents", entry.getValue());
            row.put("percentage", total == 0 ? 0 : Math.round(entry.getValue() * 10000.0 / total) / 100.0);
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, Object>> studentTeacherRatioReport() {
        long studentCount = studentAdmissionRepository.search(null, null, null, false, null).size();
        long staffCount = staffMemberRepository.count();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("totalStudents", studentCount);
        row.put("totalTeachers", staffCount);
        row.put("ratio", staffCount == 0 ? "N/A" : String.format(Locale.ROOT, "%.2f", (double) studentCount / staffCount));
        return List.of(row);
    }

    private List<Map<String, Object>> financeReport(String reportKey,
                                                     Long classId,
                                                     String section,
                                                     LocalDate dateFrom,
                                                     LocalDate dateTo,
                                                     String searchType,
                                                     String searchDuration,
                                                     Long studentId,
                                                     String incomeHead,
                                                     String expenseHead,
                                                     Long feeTypeId,
                                                     String collectBy,
                                                     String groupBy) {
        LocalDate[] resolvedRange = resolveFinanceSearchRange(
                searchDuration != null && !searchDuration.isBlank() ? searchDuration : searchType);
        boolean searchAll = "all".equalsIgnoreCase(text(searchDuration))
                || "all".equalsIgnoreCase(text(searchType));
        LocalDate from = dateFrom != null ? dateFrom
                : resolvedRange != null ? resolvedRange[0]
                : searchAll ? LocalDate.of(1900, 1, 1) : LocalDate.now().minusMonths(1);
        LocalDate to = dateTo != null ? dateTo
                : resolvedRange != null ? resolvedRange[1] : LocalDate.now();

        return switch (reportKey.toLowerCase()) {
            case "dailycollectionreport" -> feePaymentRepository.findAll().stream()
                    .filter(payment -> inDateRange(payment.getPaymentDate(), from, to))
                    .map(this::feePaymentRow)
                    .collect(Collectors.toList());
            case "feescollectionreport", "onlinefeescollectionreport" -> feePaymentRepository.findAll().stream()
                    .filter(payment -> inDateRange(payment.getPaymentDate(), from, to))
                    .filter(payment -> matchesStudentClass(payment.getStudentAdmissionId(), classId, section))
                    .map(this::feePaymentRow)
                    .collect(Collectors.toList());
            case "onlineadmissionfeescollectionreport" -> feePaymentRepository.findAll().stream()
                    .filter(payment -> inDateRange(payment.getPaymentDate(), from, to))
                    .filter(payment -> studentAdmissionRepository.findById(payment.getStudentAdmissionId())
                            .map(StudentAdmission::isOnlineAdmission)
                            .orElse(false))
                    .map(this::feePaymentRow)
                    .collect(Collectors.toList());
            case "feesstatement" -> loadStudents(classId, section, null, null, null).stream()
                    .filter(student -> studentId == null || Objects.equals(student.getId(), studentId))
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        double paid = feePaymentRepository.findAll().stream()
                                .filter(p -> Objects.equals(p.getStudentAdmissionId(), student.getId()))
                                .mapToDouble(p -> p.getPaidAmount() != null ? p.getPaidAmount() : 0.0)
                                .sum();
                        row.put("paidAmount", paid);
                        row.put("balanceAmount", 0.0);
                        return row;
                    })
                    .collect(Collectors.toList());
            case "incomereport" -> incomeRepository.findByDateBetweenOrderByDateDescIdDesc(from, to).stream()
                    .map(income -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("name", text(income.getName()));
                        row.put("invoiceNumber", text(income.getInvoiceNumber()));
                        row.put("incomeHead", text(income.getIncomeHead()));
                        row.put("date", formatDate(income.getDate()));
                        row.put("amount", income.getAmount());
                        return row;
                    })
                    .collect(Collectors.toList());
            case "expensereport" -> expenseRepository.findByDateBetweenOrderByDateDescIdDesc(from, to).stream()
                    .map(expense -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("date", formatDate(expense.getDate()));
                        row.put("expenseHead", text(expense.getExpenseHead()));
                        row.put("name", text(expense.getName()));
                        row.put("invoiceNumber", text(expense.getInvoiceNumber()));
                        row.put("amount", expense.getAmount());
                        return row;
                    })
                    .collect(Collectors.toList());
            case "incomegroupreport" -> incomeRepository.findByDateBetweenOrderByDateDescIdDesc(from, to).stream()
                    .filter(income -> incomeHead == null || incomeHead.isBlank()
                            || incomeHead.equalsIgnoreCase(text(income.getIncomeHead())))
                    .map(income -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("incomeHead", text(income.getIncomeHead()));
                        row.put("incomeId", income.getId());
                        row.put("name", text(income.getName()));
                        row.put("date", formatDate(income.getDate()));
                        row.put("invoiceNumber", text(income.getInvoiceNumber()));
                        row.put("amount", income.getAmount());
                        return row;
                    })
                    .collect(Collectors.toList());
            case "expensegroupreport" -> expenseRepository.findByDateBetweenOrderByDateDescIdDesc(from, to).stream()
                    .filter(expense -> expenseHead == null || expenseHead.isBlank()
                            || expenseHead.equalsIgnoreCase(text(expense.getExpenseHead())))
                    .map(expense -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("expenseHead", text(expense.getExpenseHead()));
                        row.put("expenseId", expense.getId());
                        row.put("name", text(expense.getName()));
                        row.put("date", formatDate(expense.getDate()));
                        row.put("invoiceNumber", text(expense.getInvoiceNumber()));
                        row.put("amount", expense.getAmount());
                        return row;
                    })
                    .collect(Collectors.toList());
            case "payrollreport" -> staffPayrollRecordRepository.findAll().stream()
                    .filter(record -> inPayrollRange(record, from, to))
                    .map(record -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        staffMemberRepository.findById(record.getStaffMemberId()).ifPresent(staff -> {
                            String staffCode = text(staff.getStaffId());
                            row.put("name", staffFullName(staff) + (staffCode.isBlank() ? "" : " (" + staffCode + ")"));
                            row.put("role", text(staff.getRoles()));
                            row.put("designation", text(staff.getDesignation()));
                        });
                        row.put("monthYear", payrollMonthYear(record.getPayrollMonth(), record.getPayrollYear()));
                        row.put("payslipNo", text(record.getPayslipNo()));
                        row.put("basicSalary", record.getBasicSalary());
                        row.put("earning", record.getTotalEarning());
                        row.put("deduction", record.getTotalDeduction());
                        row.put("grossSalary", record.getGrossSalary());
                        row.put("tax", record.getTax());
                        row.put("netSalary", record.getNetSalary());
                        return row;
                    })
                    .collect(Collectors.toList());
            case "incomeexpensereport", "incomeexpensebalancereport" -> {
                List<Map<String, Object>> rows = new ArrayList<>();
                incomeRepository.findByDateBetweenOrderByDateDescIdDesc(from, to).forEach(income -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("date", formatDate(income.getDate()));
                    row.put("name", text(income.getName()));
                    row.put("incomeExpenseHead", text(income.getIncomeHead()));
                    row.put("description", text(income.getDescription()));
                    row.put("incomeMoneyIn", income.getAmount());
                    row.put("expenseMoneyOut", 0.0);
                    row.put("overallBalance", income.getAmount());
                    rows.add(row);
                });
                expenseRepository.findByDateBetweenOrderByDateDescIdDesc(from, to).forEach(expense -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("date", formatDate(expense.getDate()));
                    row.put("name", text(expense.getName()));
                    row.put("incomeExpenseHead", text(expense.getExpenseHead()));
                    row.put("description", text(expense.getDescription()));
                    row.put("incomeMoneyIn", 0.0);
                    row.put("expenseMoneyOut", expense.getAmount());
                    row.put("overallBalance", expense.getAmount() != null ? expense.getAmount().negate() : 0.0);
                    rows.add(row);
                });
                yield rows;
            }
            case "studentacademicreport", "balancefeesstatement" -> loadStudents(classId, section, null, null, null).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("balanceAmount", 0.0);
                        return row;
                    })
                    .collect(Collectors.toList());
            case "balancefeesreportwithremark" -> loadStudents(classId, section, null, null, null).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("balanceAmount", 0.0);
                        row.put("remark", text(student.getNote()));
                        return row;
                    })
                    .collect(Collectors.toList());
            case "feegroupreport" -> List.of(summaryRow("Fee Groups", feePaymentRepository.count()));
            case "duereport" -> loadStudents(classId, section, null, null, null).stream()
                    .map(student -> {
                        Map<String, Object> row = baseStudentRow(student);
                        row.put("dueAmount", 0.0);
                        return row;
                    })
                    .collect(Collectors.toList());
            default -> List.of();
        };
    }

    private Map<String, Object> feePaymentRow(FeePayment payment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("paymentRef", text(payment.getPaymentRef()));
        row.put("studentAdmissionId", payment.getStudentAdmissionId());
        row.put("paidAmount", payment.getPaidAmount());
        row.put("discountAmount", payment.getDiscountAmount());
        row.put("fineAmount", payment.getFineAmount());
        row.put("paymentMode", text(payment.getPaymentMode()));
        row.put("paymentDate", formatDate(payment.getPaymentDate()));
        row.put("sessionYear", text(payment.getSessionYear()));
        studentAdmissionRepository.findById(payment.getStudentAdmissionId()).ifPresent(student -> {
            row.put("admissionNo", text(student.getAdmissionNo()));
            row.put("name", studentFullName(student));
            row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
            row.put("section", text(student.getSection()));
        });
        return row;
    }

    private List<Map<String, Object>> attendanceReport(String reportKey,
                                                         Long classId,
                                                         String section,
                                                         LocalDate dateFrom,
                                                         LocalDate dateTo,
                                                         String role,
                                                         Integer month,
                                                         Integer year,
                                                         String source) {
        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusDays(7);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();
        String key = reportKey.toLowerCase(Locale.ROOT);

        if ("staffattendancereport".equals(key)) {
            return staffAttendanceReport(role, month, year);
        }

        if ("staffdaywiseattendancereport".equals(key)) {
            return staffDayWiseAttendanceReport(role, dateFrom, source);
        }

        if (key.startsWith("staff") || "dailyattendancereport".equals(key)) {
            if ("dailyattendancereport".equals(key)) {
                return studentAttendanceEntryRepository.findAll().stream()
                        .filter(entry -> inDateRange(entry.getAttendanceDate(), from, to))
                        .collect(Collectors.groupingBy(StudentAttendanceEntry::getAttendanceDate, LinkedHashMap::new, Collectors.counting()))
                        .entrySet().stream()
                        .map(entry -> {
                            Map<String, Object> row = new LinkedHashMap<>();
                            row.put("attendanceDate", formatDate(entry.getKey()));
                            row.put("totalRecords", entry.getValue());
                            return row;
                        })
                        .collect(Collectors.toList());
            }
            return staffAttendanceEntryRepository.findAll().stream()
                    .filter(entry -> inDateRange(entry.getAttendanceDate(), from, to))
                    .map(entry -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("staffId", entry.getStaffMemberId());
                        row.put("attendanceDate", formatDate(entry.getAttendanceDate()));
                        row.put("status", text(entry.getStatus()));
                        row.put("entryTime", text(entry.getEntryTime()));
                        row.put("exitTime", text(entry.getExitTime()));
                        return row;
                    })
                    .collect(Collectors.toList());
        }

        if ("studentattendancetypereport".equals(key)) {
            return studentAttendanceEntriesForStudents(classId, section, from, to).stream()
                    .collect(Collectors.groupingBy(
                            row -> text(String.valueOf(row.get("status"))),
                            LinkedHashMap::new,
                            Collectors.counting()))
                    .entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("attendanceType", entry.getKey());
                        row.put("totalStudents", entry.getValue());
                        return row;
                    })
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> rows = studentAttendanceEntriesForStudents(classId, section, from, to);
        if ("biometricattendancelog".equals(key)) {
            return rows.stream()
                    .filter(row -> "Biometric".equalsIgnoreCase(String.valueOf(row.get("source"))))
                    .collect(Collectors.toList());
        }
        return rows;
    }

    private List<Map<String, Object>> staffAttendanceReport(String role, Integer month, Integer year) {
        if (month == null || year == null) {
            throw new IllegalArgumentException("Month and year are required");
        }

        String normalizedRole = text(role);
        Map<Long, StaffMember> staffById = staffMemberRepository.findAll().stream()
                .filter(staff -> normalizedRole.isBlank() || staffMatchesRole(staff, normalizedRole))
                .collect(Collectors.toMap(StaffMember::getId, staff -> staff, (a, b) -> a));

        return staffAttendanceEntryRepository.findAll().stream()
                .filter(entry -> staffById.containsKey(entry.getStaffMemberId()))
                .filter(entry -> entry.getAttendanceDate() != null
                        && entry.getAttendanceDate().getMonthValue() == month
                        && entry.getAttendanceDate().getYear() == year)
                .map(entry -> {
                    StaffMember staff = staffById.get(entry.getStaffMemberId());
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("staffId", text(staff.getStaffId()));
                    row.put("name", staffFullName(staff));
                    row.put("role", primaryRole(staff.getRoles()));
                    row.put("department", text(staff.getDepartment()));
                    row.put("attendanceDate", formatDate(entry.getAttendanceDate()));
                    row.put("status", text(entry.getStatus()));
                    row.put("entryTime", text(entry.getEntryTime()));
                    row.put("exitTime", text(entry.getExitTime()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> staffDayWiseAttendanceReport(String role, LocalDate attendanceDate, String source) {
        if (attendanceDate == null) {
            throw new IllegalArgumentException("Date is required");
        }

        String normalizedRole = text(role);
        String normalizedSource = text(source);
        List<StaffMember> staffMembers = staffMemberRepository.findAll().stream()
                .filter(staff -> !Boolean.TRUE.equals(staff.getDisabled()))
                .filter(staff -> normalizedRole.isBlank() || staffMatchesRole(staff, normalizedRole))
                .sorted(Comparator.comparing(staff -> staffFullName(staff), String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<Long> staffIds = staffMembers.stream().map(StaffMember::getId).toList();
        Map<Long, StaffAttendanceEntry> entriesByStaffId = staffIds.isEmpty()
                ? Map.of()
                : staffAttendanceEntryRepository.findByAttendanceDateAndStaffMemberIdIn(attendanceDate, staffIds).stream()
                        .collect(Collectors.toMap(StaffAttendanceEntry::getStaffMemberId, entry -> entry, (a, b) -> a));

        return staffMembers.stream()
                .map(staff -> {
                    StaffAttendanceEntry entry = entriesByStaffId.get(staff.getId());
                    String entrySource = entry != null ? text(entry.getSource()) : "N/A";
                    if (entrySource.isBlank()) {
                        entrySource = "N/A";
                    }
                    if (!normalizedSource.isBlank() && !entrySource.equalsIgnoreCase(normalizedSource)) {
                        return null;
                    }

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("staffId", text(staff.getStaffId()));
                    row.put("name", staffFullName(staff));
                    row.put("role", primaryRole(staff.getRoles()));
                    row.put("department", text(staff.getDepartment()));
                    row.put("attendanceDate", formatDate(attendanceDate));
                    row.put("status", entry != null ? text(entry.getStatus()) : "Absent");
                    row.put("source", entrySource);
                    row.put("entryTime", entry != null ? text(entry.getEntryTime()) : "");
                    row.put("exitTime", entry != null ? text(entry.getExitTime()) : "");
                    return row;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private boolean staffMatchesRole(StaffMember staff, String role) {
        String roles = staff.getRoles();
        if (roles == null || roles.isBlank()) {
            return false;
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .anyMatch(item -> item.equalsIgnoreCase(role));
    }

    private String primaryRole(String roles) {
        if (roles == null || roles.isBlank()) {
            return "";
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .findFirst()
                .orElse("");
    }

    private List<Map<String, Object>> studentAttendanceEntriesForStudents(Long classId,
                                                                          String section,
                                                                          LocalDate from,
                                                                          LocalDate to) {
        List<StudentAdmission> students = loadStudents(classId, section, null, null, null);
        Map<Long, StudentAdmission> studentMap = students.stream()
                .collect(Collectors.toMap(StudentAdmission::getId, s -> s, (a, b) -> a));

        return studentAttendanceEntryRepository.findAll().stream()
                .filter(entry -> studentMap.containsKey(entry.getStudentAdmissionId()))
                .filter(entry -> inDateRange(entry.getAttendanceDate(), from, to))
                .map(entry -> {
                    StudentAdmission student = studentMap.get(entry.getStudentAdmissionId());
                    Map<String, Object> row = baseStudentRow(student);
                    row.put("attendanceDate", formatDate(entry.getAttendanceDate()));
                    row.put("status", text(entry.getStatus()));
                    row.put("source", text(entry.getSource()));
                    row.put("entryTime", text(entry.getEntryTime()));
                    row.put("exitTime", text(entry.getExitTime()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> examinationReport(String reportKey, Long classId, String section) {
        return examResultRecordRepository.findAll().stream()
                .filter(record -> record.getStudentAdmission() != null)
                .filter(record -> classId == null || (record.getStudentAdmission().getSchoolClass() != null
                        && Objects.equals(record.getStudentAdmission().getSchoolClass().getId(), classId)))
                .filter(record -> section == null || section.isBlank()
                        || section.equalsIgnoreCase(text(record.getStudentAdmission().getSection())))
                .map(record -> {
                    StudentAdmission student = record.getStudentAdmission();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("admissionNo", text(student.getAdmissionNo()));
                    row.put("name", studentFullName(student));
                    row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
                    row.put("section", text(student.getSection()));
                    row.put("examName", record.getExamGroupExam() != null ? text(record.getExamGroupExam().getName()) : "");
                    row.put("totalMarks", record.getGrandTotal());
                    row.put("obtainedMarks", record.getGrandTotal());
                    row.put("percentage", record.getPercent());
                    row.put("rank", record.getStudentRank());
                    row.put("result", text(record.getResultStatus()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> onlineExaminationReport(String reportKey,
                                                              Long examId,
                                                              Long classId,
                                                              String section,
                                                              String searchType,
                                                              String dateType) {
        String key = reportKey.toLowerCase(Locale.ROOT);

        if ("examsreport".equals(key)) {
            return onlineExamsReport(searchType, dateType);
        }

        if ("studentexamsattemptreport".equals(key)) {
            return studentExamsAttemptReport(searchType, dateType);
        }

        if (examId == null) {
            throw new IllegalArgumentException("Exam is required");
        }
        if (classId == null) {
            throw new IllegalArgumentException("Class is required");
        }
        if (section == null || section.isBlank()) {
            throw new IllegalArgumentException("Section is required");
        }

        OnlineExam exam = onlineExamRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        Set<Long> assignedStudentIds = onlineExamStudentRepository.findByOnlineExamId(examId).stream()
                .map(OnlineExamStudent::getStudentAdmissionId)
                .collect(Collectors.toSet());

        List<StudentAdmission> students = loadStudents(classId, section, null, null, null).stream()
                .filter(student -> assignedStudentIds.isEmpty() || assignedStudentIds.contains(student.getId()))
                .sorted(Comparator.comparing(this::studentFullName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        if ("examsrankreport".equals(key)) {
            List<Map<String, Object>> rows = new ArrayList<>();
            int rank = 1;
            for (StudentAdmission student : students) {
                Map<String, Object> row = onlineExamStudentRow(student, exam);
                row.put("rank", rank++);
                row.put("percentage", "0");
                row.put("result", "Pending");
                rows.add(row);
            }
            return rows;
        }

        return students.stream()
                .map(student -> {
                    Map<String, Object> row = onlineExamStudentRow(student, exam);
                    row.put("action", "View");
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> onlineExamsReport(String searchType, String dateType) {
        if (searchType == null || searchType.isBlank()) {
            throw new IllegalArgumentException("Search type is required");
        }
        if (dateType == null || dateType.isBlank()) {
            throw new IllegalArgumentException("Date type is required");
        }

        return onlineExamRepository.findAll().stream()
                .filter(exam -> onlineExamMatchesDateFilter(exam, searchType, dateType))
                .sorted(Comparator.comparing(OnlineExam::getExamFrom, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::onlineExamSummaryRow)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> studentExamsAttemptReport(String searchType, String dateType) {
        if (searchType == null || searchType.isBlank()) {
            throw new IllegalArgumentException("Search type is required");
        }
        if (dateType == null || dateType.isBlank()) {
            throw new IllegalArgumentException("Date type is required");
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        List<OnlineExam> exams = onlineExamRepository.findAll().stream()
                .filter(exam -> onlineExamMatchesDateFilter(exam, searchType, dateType))
                .sorted(Comparator.comparing(OnlineExam::getExamFrom, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        for (OnlineExam exam : exams) {
            Set<Long> assignedStudentIds = onlineExamStudentRepository.findByOnlineExamId(exam.getId()).stream()
                    .map(OnlineExamStudent::getStudentAdmissionId)
                    .collect(Collectors.toSet());

            List<StudentAdmission> students = assignedStudentIds.isEmpty()
                    ? studentAdmissionRepository.findAll().stream()
                            .filter(student -> !student.isDisabled())
                            .sorted(Comparator.comparing(this::studentFullName, String.CASE_INSENSITIVE_ORDER))
                            .toList()
                    : studentAdmissionRepository.findAllById(assignedStudentIds).stream()
                            .sorted(Comparator.comparing(this::studentFullName, String.CASE_INSENSITIVE_ORDER))
                            .toList();

            for (StudentAdmission student : students) {
                Map<String, Object> row = onlineExamStudentRow(student, exam);
                row.put("examTitle", text(exam.getTitle()));
                rows.add(row);
            }
        }
        return rows;
    }

    private Map<String, Object> onlineExamSummaryRow(OnlineExam exam) {
        long assignedStudents = onlineExamStudentRepository.findByOnlineExamId(exam.getId()).size();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("examTitle", text(exam.getTitle()));
        row.put("examFrom", formatDateTime(exam.getExamFrom()));
        row.put("examTo", formatDateTime(exam.getExamTo()));
        row.put("duration", text(exam.getTimeDuration()));
        row.put("attempt", exam.getAttempt());
        row.put("passingPercentage", exam.getPassingPercentage());
        row.put("publishExam", Boolean.TRUE.equals(exam.getPublishExam()) ? "Yes" : "No");
        row.put("publishResult", Boolean.TRUE.equals(exam.getPublishResult()) ? "Yes" : "No");
        row.put("assignedStudents", assignedStudents);
        return row;
    }

    private Map<String, Object> onlineExamStudentRow(StudentAdmission student, OnlineExam exam) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("admissionNo", text(student.getAdmissionNo()));
        row.put("studentName", studentFullName(student));
        row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
        row.put("section", text(student.getSection()));
        row.put("totalAttempt", 0);
        row.put("remainingAttempt", exam.getAttempt() != null ? exam.getAttempt() : 0);
        row.put("examSubmitted", "No");
        return row;
    }

    private boolean onlineExamMatchesDateFilter(OnlineExam exam, String searchType, String dateType) {
        LocalDate[] range = resolveOnlineExamSearchRange(searchType);
        if (range == null) {
            return true;
        }
        java.time.LocalDateTime examDateTime = "exam_to".equalsIgnoreCase(text(dateType))
                ? exam.getExamTo()
                : exam.getExamFrom();
        if (examDateTime == null) {
            return false;
        }
        LocalDate examDate = examDateTime.toLocalDate();
        return !examDate.isBefore(range[0]) && !examDate.isAfter(range[1]);
    }

    private LocalDate[] resolveOnlineExamSearchRange(String searchType) {
        return resolveFinanceSearchRange(searchType);
    }

    private LocalDate[] resolveFinanceSearchRange(String searchType) {
        if (searchType == null || searchType.isBlank() || "all".equalsIgnoreCase(searchType)) {
            return null;
        }
        LocalDate today = LocalDate.now();
        String type = text(searchType).toLowerCase(Locale.ROOT);
        return switch (type) {
            case "today" -> new LocalDate[]{today, today};
            case "this_week" -> new LocalDate[]{today.with(java.time.DayOfWeek.MONDAY), today.with(java.time.DayOfWeek.SUNDAY)};
            case "this_month" -> new LocalDate[]{today.withDayOfMonth(1), today.withDayOfMonth(today.lengthOfMonth())};
            case "this_year" -> new LocalDate[]{today.withDayOfYear(1), today.withDayOfYear(today.lengthOfYear())};
            case "last_month" -> {
                LocalDate lastMonth = today.minusMonths(1);
                yield new LocalDate[]{lastMonth.withDayOfMonth(1), lastMonth.withDayOfMonth(lastMonth.lengthOfMonth())};
            }
            default -> new LocalDate[]{today.withDayOfYear(1), today.withDayOfYear(today.lengthOfYear())};
        };
    }

    private String payrollMonthYear(Integer month, Integer year) {
        if (month == null || year == null) {
            return "";
        }
        String[] monthNames = {
                "", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        };
        if (month < 1 || month > 12) {
            return month + " - " + year;
        }
        return monthNames[month] + " - " + year;
    }

    private String className(Long classId) {
        if (classId == null) {
            return "";
        }
        return studentAdmissionRepository.findAll().stream()
                .filter(student -> student.getSchoolClass() != null
                        && Objects.equals(student.getSchoolClass().getId(), classId))
                .map(student -> text(student.getSchoolClass().getName()))
                .filter(name -> !name.isBlank())
                .findFirst()
                .orElse("");
    }

    private List<Map<String, Object>> lessonPlanReport(String reportKey,
                                                       Long classId,
                                                       String section,
                                                       LocalDate dateFrom,
                                                       LocalDate dateTo) {
        return lessonPlanLessonRepository.findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc().stream()
                .filter(lesson -> classId == null || Objects.equals(lesson.getClassId(), classId))
                .filter(lesson -> section == null || section.isBlank()
                        || section.equalsIgnoreCase(text(lesson.getSection())))
                .map(lesson -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("className", text(lesson.getClassName()));
                    row.put("section", text(lesson.getSection()));
                    row.put("subject", text(lesson.getSubjectName()));
                    row.put("lessonName", text(lesson.getLessonName()));
                    row.put("topicCount", lesson.getTopics() != null ? lesson.getTopics().size() : 0);
                    row.put("session", text(lesson.getAcademicSession()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> humanResourceReport(String reportKey, LocalDate dateFrom, LocalDate dateTo) {
        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(1);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();

        return switch (reportKey.toLowerCase()) {
            case "staffreport" -> staffMemberRepository.findAll().stream()
                    .map(staff -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("staffId", text(staff.getStaffId()));
                        row.put("name", staffFullName(staff));
                        row.put("designation", text(staff.getDesignation()));
                        row.put("department", text(staff.getDepartment()));
                        row.put("email", text(staff.getEmail()));
                        row.put("phone", text(staff.getPhone()));
                        return row;
                    })
                    .collect(Collectors.toList());
            case "payrollreport" -> staffPayrollRecordRepository.findAll().stream()
                    .filter(record -> inPayrollRange(record, from, to))
                    .map(record -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        staffMemberRepository.findById(record.getStaffMemberId()).ifPresent(staff ->
                                row.put("staffName", staffFullName(staff)));
                        row.put("payrollMonth", record.getPayrollMonth() + "/" + record.getPayrollYear());
                        row.put("basicSalary", record.getBasicSalary());
                        row.put("netSalary", record.getNetSalary());
                        row.put("status", text(record.getStatus()));
                        return row;
                    })
                    .collect(Collectors.toList());
            case "leaveapplicationreport" -> staffLeaveRequestRepository.findAll().stream()
                    .filter(request -> inDateRange(request.getApplyDate(), from, to))
                    .map(request -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("staffName", text(request.getStaffName()));
                        row.put("leaveType", text(request.getLeaveType()));
                        row.put("applyDate", formatDate(request.getApplyDate()));
                        row.put("fromDate", formatDate(request.getFromDate()));
                        row.put("toDate", formatDate(request.getToDate()));
                        row.put("status", text(request.getStatus()));
                        return row;
                    })
                    .collect(Collectors.toList());
            case "staffattendancesummary" -> staffAttendanceEntryRepository.findAll().stream()
                    .filter(entry -> inDateRange(entry.getAttendanceDate(), from, to))
                    .map(entry -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("staffId", entry.getStaffMemberId());
                        row.put("attendanceDate", formatDate(entry.getAttendanceDate()));
                        row.put("status", text(entry.getStatus()));
                        return row;
                    })
                    .collect(Collectors.toList());
            default -> List.of();
        };
    }

    private List<Map<String, Object>> homeworkReport(String reportKey,
                                                       Long classId,
                                                       String section,
                                                       LocalDate dateFrom,
                                                       LocalDate dateTo) {
        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(1);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();
        return homeworkRepository.findAll().stream()
                .filter(hw -> inDateRange(hw.getHomeworkDate(), from, to))
                .filter(hw -> classId == null || Objects.equals(hw.getClassId(), classId))
                .filter(hw -> section == null || section.isBlank()
                        || section.equalsIgnoreCase(text(hw.getSection())))
                .map(hw -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("className", text(hw.getClassName()));
                    row.put("section", text(hw.getSection()));
                    row.put("subject", text(hw.getSubjectName()));
                    row.put("homeworkDate", formatDate(hw.getHomeworkDate()));
                    row.put("description", text(hw.getDescription()));
                    row.put("evaluationDate", formatDate(hw.getEvaluationDate()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> libraryReport(String reportKey, LocalDate dateFrom, LocalDate dateTo) {
        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(1);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();
        return libraryBookIssueRepository.findAll().stream()
                .filter(issue -> inDateRange(issue.getIssueDate(), from, to))
                .map(issue -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("bookTitle", issue.getBook() != null ? text(issue.getBook().getTitle()) : "");
                    row.put("memberName", resolveLibraryMemberName(issue.getMember()));
                    row.put("issueDate", formatDate(issue.getIssueDate()));
                    row.put("dueDate", formatDate(issue.getDueDate()));
                    row.put("returnDate", formatDate(issue.getReturnDate()));
                    row.put("status", issue.getReturnDate() == null ? "Issued" : "Returned");
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> inventoryReport(String reportKey, LocalDate dateFrom, LocalDate dateTo) {
        return inventoryItemRepository.findAll().stream()
                .map(item -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("itemName", text(item.getName()));
                    row.put("category", item.getCategory() != null ? text(item.getCategory().getName()) : "");
                    row.put("quantity", item.getAvailableQuantity());
                    row.put("unit", text(item.getUnit()));
                    row.put("description", text(item.getDescription()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> transportReport(String reportKey, Long classId, String section) {
        if ("routereport".equalsIgnoreCase(reportKey)) {
            return transportRouteRepository.findAll().stream()
                    .map(route -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("routeTitle", text(route.getTitle()));
                        return row;
                    })
                    .collect(Collectors.toList());
        }
        return loadStudents(classId, section, null, null, null).stream()
                .filter(student -> text(student.getRouteList()).length() > 0)
                .map(student -> {
                    Map<String, Object> row = baseStudentRow(student);
                    row.put("route", text(student.getRouteList()));
                    row.put("pickupPoint", text(student.getPickupPoint()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> hostelReport(String reportKey) {
        if ("hostelroomreport".equalsIgnoreCase(reportKey)) {
            return hostelRepository.findAll().stream()
                    .map(hostel -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("hostelName", text(hostel.getHostelName()));
                        row.put("type", text(hostel.getType()));
                        row.put("address", text(hostel.getAddress()));
                        row.put("intake", hostel.getIntake());
                        return row;
                    })
                    .collect(Collectors.toList());
        }
        return studentAdmissionRepository.search(null, null, null, false, null).stream()
                .filter(student -> student.getHostel() != null)
                .map(student -> {
                    Map<String, Object> row = baseStudentRow(student);
                    row.put("hostelName", text(student.getHostel().getHostelName()));
                    row.put("roomNo", student.getHostelRoom() != null ? text(student.getHostelRoom().getRoomNumber()) : "");
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> alumniReport(String reportKey, LocalDate dateFrom, LocalDate dateTo) {
        if ("alumnieventreport".equalsIgnoreCase(reportKey)) {
            LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(6);
            LocalDate to = dateTo != null ? dateTo : LocalDate.now();
            return alumniEventRepository.findAll().stream()
                    .filter(event -> inDateRange(event.getFromDate(), from, to))
                    .map(event -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("eventTitle", text(event.getTitle()));
                        row.put("eventFrom", formatDate(event.getFromDate()));
                        row.put("eventTo", formatDate(event.getToDate()));
                        row.put("venue", text(event.getNote()));
                        return row;
                    })
                    .collect(Collectors.toList());
        }
        return alumniRepository.findAll().stream()
                .map(alumni -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("admissionNumber", text(alumni.getAdmissionNumber()));
                    row.put("studentName", text(alumni.getStudentName()));
                    row.put("className", text(alumni.getClassName()));
                    row.put("sectionName", text(alumni.getSectionName()));
                    row.put("sessionName", text(alumni.getSessionName()));
                    row.put("gender", text(alumni.getGender()));
                    row.put("mobileNumber", text(alumni.getCurrentPhone()));
                    row.put("email", text(alumni.getCurrentEmail()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> userLogReport(LocalDate dateFrom, LocalDate dateTo) {
        return appUserAccountRepository.findAll().stream()
                .map(account -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("username", text(account.getUsername()));
                    row.put("userType", text(account.getUserType()));
                    row.put("loginEnabled", Boolean.TRUE.equals(account.getLoginEnabled()) ? "Yes" : "No");
                    row.put("createdAt", account.getCreatedAt() != null
                            ? account.getCreatedAt().toLocalDate().format(DATE_FMT) : "");
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> auditTrailReport(LocalDate dateFrom, LocalDate dateTo) {
        List<Map<String, Object>> rows = new ArrayList<>();
        appUserAccountRepository.findAll().forEach(account -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("module", "User Account");
            row.put("action", "Account Active");
            row.put("user", text(account.getUsername()));
            row.put("date", account.getUpdatedAt() != null
                    ? account.getUpdatedAt().toLocalDate().format(DATE_FMT)
                    : (account.getCreatedAt() != null ? account.getCreatedAt().toLocalDate().format(DATE_FMT) : ""));
            row.put("description", "User account " + text(account.getUsername()) + " (" + text(account.getUserType()) + ")");
            rows.add(row);
        });
        return rows;
    }

    private boolean matchesStudentClass(Long studentAdmissionId, Long classId, String section) {
        if (classId == null && (section == null || section.isBlank())) {
            return true;
        }
        return studentAdmissionRepository.findById(studentAdmissionId)
                .map(student -> (classId == null || (student.getSchoolClass() != null
                        && Objects.equals(student.getSchoolClass().getId(), classId)))
                        && (section == null || section.isBlank()
                        || section.equalsIgnoreCase(text(student.getSection()))))
                .orElse(false);
    }

    private Map<String, Object> summaryRow(String label, long count) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("total", count);
        return row;
    }

    private boolean inDateRange(LocalDate value, LocalDate from, LocalDate to) {
        if (value == null) {
            return from == null && to == null;
        }
        if (from != null && value.isBefore(from)) {
            return false;
        }
        return to == null || !value.isAfter(to);
    }

    private String studentFullName(StudentAdmission student) {
        return (text(student.getFirstName()) + " " + text(student.getLastName())).trim();
    }

    private String staffFullName(StaffMember staff) {
        return (text(staff.getFirstName()) + " " + text(staff.getLastName())).trim();
    }

    private String resolveLibraryMemberName(LibraryMember member) {
        if (member == null) {
            return "";
        }
        if (member.getStudentAdmission() != null) {
            return studentFullName(member.getStudentAdmission());
        }
        if (member.getStaffMember() != null) {
            return staffFullName(member.getStaffMember());
        }
        return text(member.getLibraryCardNo());
    }

    private boolean inPayrollRange(StaffPayrollRecord record, LocalDate from, LocalDate to) {
        if (record.getPayrollYear() == null || record.getPayrollMonth() == null) {
            return true;
        }
        LocalDate payrollDate = LocalDate.of(record.getPayrollYear(), record.getPayrollMonth(), 1);
        return inDateRange(payrollDate, from, to);
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.format(DATE_FMT);
    }

    private String formatDateTime(java.time.LocalDateTime dateTime) {
        return dateTime == null ? "" : dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
