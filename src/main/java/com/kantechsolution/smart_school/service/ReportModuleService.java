package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.report.ReportCategoryDefinition;
import com.kantechsolution.smart_school.report.ReportDefinition;
import com.kantechsolution.smart_school.report.ReportModuleCatalog;
import com.kantechsolution.smart_school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportModuleService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter US_DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

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
    private LibraryRepository libraryRepository;

    @Autowired
    private HomeworkStudentEvaluationRepository homeworkStudentEvaluationRepository;

    @Autowired
    private DailyAssignmentRepository dailyAssignmentRepository;

    @Autowired
    private LibraryBookIssueRepository libraryBookIssueRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private InventoryItemStockRepository inventoryItemStockRepository;

    @Autowired
    private InventoryIssueItemRepository inventoryIssueItemRepository;

    @Autowired
    private TransportRouteRepository transportRouteRepository;

    @Autowired
    private TransportRouteStopRepository transportRouteStopRepository;

    @Autowired
    private TransportRouteVehicleRepository transportRouteVehicleRepository;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private AlumniService alumniService;

    @Autowired
    private UserLogService userLogService;

    @Autowired
    private AuditTrailService auditTrailService;

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
    private LessonPlanScheduleRepository lessonPlanScheduleRepository;

    @Autowired
    private LessonPlanDetailRepository lessonPlanDetailRepository;

    @Autowired
    private LessonPlanSyllabusStatusRepository lessonPlanSyllabusStatusRepository;

    @Autowired
    private ExamResultRecordRepository examResultRecordRepository;

    @Autowired
    private AppCurrencyService appCurrencyService;

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
                                               String groupBy,
                                               Long subjectGroupId,
                                               Long subjectId,
                                               String status,
                                               String designation,
                                               String searchTypeBy,
                                               Long staffMemberId,
                                               LocalDate joiningDate) {
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
            case "lessonplan" -> lessonPlanReport(reportKey, classId, section, subjectGroupId, subjectId, dateFrom, dateTo);
            case "humanresource" -> humanResourceReport(reportKey, dateFrom, dateTo, role, month, year, status,
                    designation, searchTypeBy, staffMemberId, joiningDate);
            case "homework" -> homeworkReport(reportKey, classId, section, subjectGroupId, subjectId, searchType);
            case "library" -> libraryReport(reportKey, searchType, source);
            case "inventory" -> inventoryReport(reportKey, searchType);
            case "transport" -> transportReport(reportKey, classId, section, source, role, designation);
            case "hostel" -> hostelReport(reportKey, classId, section, categoryId);
            case "alumni" -> alumniReport(reportKey, classId, section, categoryId, dateFrom, dateTo);
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
                                                       Long subjectGroupId,
                                                       Long subjectId,
                                                       LocalDate dateFrom,
                                                       LocalDate dateTo) {
        return switch (reportKey.toLowerCase()) {
            case "syllabusstatusreport" -> syllabusStatusReportRows(classId, section, subjectGroupId);
            case "subjectlessonreport" -> subjectLessonPlanReportRows(classId, section, subjectGroupId, subjectId);
            case "lessonplanreport" -> lessonPlanLessonRepository.findAllByOrderByClassNameAscSectionAscLessonNameAscIdAsc().stream()
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
            default -> List.of();
        };
    }

    private List<Map<String, Object>> syllabusStatusReportRows(Long classId, String section, Long subjectGroupId) {
        if (classId == null || section == null || section.isBlank() || subjectGroupId == null) {
            throw new IllegalArgumentException("Class, section and subject group are required.");
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        List<LessonPlanLesson> lessons = lessonPlanLessonRepository
                .findByClassIdAndSectionIgnoreCaseAndSubjectGroupIdOrderBySubjectNameAscLessonNameAsc(
                        classId, section.trim(), subjectGroupId);

        for (LessonPlanLesson lesson : lessons) {
            if (lesson.getTopics() == null) {
                continue;
            }
            for (LessonPlanTopic topic : lesson.getTopics()) {
                LessonPlanSyllabusStatus status = lessonPlanSyllabusStatusRepository.findByTopicId(topic.getId())
                        .orElse(LessonPlanSyllabusStatus.builder()
                                .topicId(topic.getId())
                                .completed(false)
                                .build());
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("subjectName", text(lesson.getSubjectName()));
                row.put("lessonName", text(lesson.getLessonName()));
                row.put("topicName", text(topic.getTopicName()));
                row.put("status", Boolean.TRUE.equals(status.getCompleted()) ? "Complete" : "Incomplete");
                row.put("completionDate", status.getCompletionDate() != null
                        ? formatDate(status.getCompletionDate()) : "");
                rows.add(row);
            }
        }
        return rows;
    }

    private List<Map<String, Object>> subjectLessonPlanReportRows(Long classId,
                                                                   String section,
                                                                   Long subjectGroupId,
                                                                   Long subjectId) {
        if (classId == null || section == null || section.isBlank()
                || subjectGroupId == null || subjectId == null) {
            throw new IllegalArgumentException("Class, section, subject group and subject are required.");
        }

        return lessonPlanScheduleRepository.findAll().stream()
                .filter(schedule -> Objects.equals(schedule.getClassId(), classId))
                .filter(schedule -> section.equalsIgnoreCase(text(schedule.getSection())))
                .filter(schedule -> Objects.equals(schedule.getSubjectId(), subjectId))
                .sorted(Comparator.comparing(LessonPlanSchedule::getPlanDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(LessonPlanSchedule::getTimeFrom, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(schedule -> {
                    LessonPlanDetail detail = lessonPlanDetailRepository.findByScheduleId(schedule.getId()).orElse(null);
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("teacher", text(schedule.getTeacherName()));
                    row.put("lessonName", detail != null && !text(detail.getLessonName()).isBlank()
                            ? text(detail.getLessonName()) : "");
                    row.put("topicName", detail != null ? text(detail.getTopicName()) : "");
                    row.put("subTopic", detail != null ? text(detail.getSubTopic()) : "");
                    row.put("date", formatDate(schedule.getPlanDate()));
                    row.put("timeFrom", formatTime(schedule.getTimeFrom()));
                    row.put("timeTo", formatTime(schedule.getTimeTo()));
                    row.put("scheduleId", schedule.getId());
                    return row;
                })
                .collect(Collectors.toList());
    }

    private String formatTime(java.time.LocalTime time) {
        if (time == null) {
            return "";
        }
        return time.format(DateTimeFormatter.ofPattern("hh:mm a"));
    }

    private List<Map<String, Object>> humanResourceReport(String reportKey,
                                                           LocalDate dateFrom,
                                                           LocalDate dateTo,
                                                           String role,
                                                           Integer month,
                                                           Integer year,
                                                           String status,
                                                           String designation,
                                                           String searchTypeBy,
                                                           Long staffMemberId,
                                                           LocalDate joiningDate) {
        return switch (reportKey.toLowerCase()) {
            case "staffreport" -> staffReportRows(status, role, designation, searchTypeBy);
            case "payrollreport" -> hrPayrollReportRows(role, month, year);
            case "leaverequestreport" -> leaveRequestReportRows(dateFrom, dateTo, joiningDate, staffMemberId, status, false);
            case "myleaverequestreport" -> leaveRequestReportRows(dateFrom, dateTo, null, null, status, true);
            default -> List.of();
        };
    }

    private List<Map<String, Object>> staffReportRows(String status, String role, String designation, String searchTypeBy) {
        LocalDate[] range = resolveFinanceSearchRange(searchTypeBy);
        return staffMemberRepository.findAll().stream()
                .filter(staff -> matchesStaffStatus(staff, status))
                .filter(staff -> role == null || role.isBlank()
                        || text(staff.getRoles()).toLowerCase(Locale.ROOT).contains(role.toLowerCase(Locale.ROOT)))
                .filter(staff -> designation == null || designation.isBlank()
                        || designation.equalsIgnoreCase(text(staff.getDesignation())))
                .filter(staff -> {
                    if (range == null) {
                        return true;
                    }
                    LocalDate joining = staff.getDateOfJoining();
                    return joining != null && !joining.isBefore(range[0]) && !joining.isAfter(range[1]);
                })
                .map(staff -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("staffId", text(staff.getStaffId()));
                    row.put("role", text(staff.getRoles()));
                    row.put("designation", text(staff.getDesignation()));
                    row.put("department", text(staff.getDepartment()));
                    row.put("name", staffFullName(staff));
                    row.put("fatherName", text(staff.getFatherName()));
                    row.put("motherName", text(staff.getMotherName()));
                    row.put("email", text(staff.getEmail()));
                    row.put("gender", text(staff.getGender()));
                    row.put("dateOfBirth", formatUsDate(staff.getDateOfBirth()));
                    row.put("dateOfJoining", formatUsDate(staff.getDateOfJoining()));
                    row.put("phone", text(staff.getPhone()));
                    row.put("emergencyContactNumber", text(staff.getEmergencyContact()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> hrPayrollReportRows(String role, Integer month, Integer year) {
        if (year == null) {
            throw new IllegalArgumentException("Year is required.");
        }
        int payrollMonth = month != null ? month : LocalDate.now().getMonthValue();
        return staffPayrollRecordRepository.findAll().stream()
                .filter(record -> Objects.equals(record.getPayrollYear(), year))
                .filter(record -> month == null || Objects.equals(record.getPayrollMonth(), payrollMonth))
                .filter(record -> {
                    if (role == null || role.isBlank()) {
                        return true;
                    }
                    return staffMemberRepository.findById(record.getStaffMemberId())
                            .map(staff -> text(staff.getRoles()).toLowerCase(Locale.ROOT).contains(role.toLowerCase(Locale.ROOT)))
                            .orElse(false);
                })
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
    }

    private List<Map<String, Object>> leaveRequestReportRows(LocalDate dateFrom,
                                                              LocalDate dateTo,
                                                              LocalDate joiningDate,
                                                              Long staffMemberId,
                                                              String status,
                                                              boolean myLeaveOnly) {
        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(1);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();

        return staffLeaveRequestRepository.findAll().stream()
                .filter(request -> inDateRange(request.getApplyDate(), from, to))
                .filter(request -> staffMemberId == null || Objects.equals(request.getStaffMemberId(), staffMemberId))
                .filter(request -> status == null || status.isBlank()
                        || status.equalsIgnoreCase(text(request.getStatus())))
                .filter(request -> {
                    if (joiningDate == null) {
                        return true;
                    }
                    return staffMemberRepository.findById(request.getStaffMemberId())
                            .map(staff -> Objects.equals(staff.getDateOfJoining(), joiningDate))
                            .orElse(false);
                })
                .filter(request -> !myLeaveOnly || isCurrentStaffLeave(request))
                .map(this::leaveRequestRow)
                .collect(Collectors.toList());
    }

    private static final String DEFAULT_LEAVE_SUBMITTER_STAFF_ID = "9000";

    private boolean isCurrentStaffLeave(StaffLeaveRequest request) {
        return staffMemberRepository.findByStaffId(DEFAULT_LEAVE_SUBMITTER_STAFF_ID)
                .map(staff -> Objects.equals(request.getStaffMemberId(), staff.getId()))
                .orElseGet(() -> staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()
                        .stream()
                        .findFirst()
                        .map(staff -> Objects.equals(request.getStaffMemberId(), staff.getId()))
                        .orElse(false));
    }

    private Map<String, Object> leaveRequestRow(StaffLeaveRequest request) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("staff", text(request.getStaffName()) + " (" + text(request.getStaffIdCode()) + ")");
        row.put("leaveType", text(request.getLeaveType()));
        row.put("halfDay", text(request.getHalfDay()));
        staffMemberRepository.findById(request.getStaffMemberId()).ifPresent(staff ->
                row.put("dateOfJoining", formatUsDate(staff.getDateOfJoining())));
        if (!row.containsKey("dateOfJoining")) {
            row.put("dateOfJoining", "");
        }
        row.put("applyDate", formatUsDate(request.getApplyDate()));
        row.put("leaveDate", formatUsDate(request.getFromDate()) + " - " + formatUsDate(request.getToDate()));
        row.put("days", request.getDays());
        row.put("status", text(request.getStatus()));
        return row;
    }

    private boolean matchesStaffStatus(StaffMember staff, String status) {
        if (status == null || status.isBlank() || "All".equalsIgnoreCase(status)) {
            return true;
        }
        boolean disabled = Boolean.TRUE.equals(staff.getDisabled());
        if ("Inactive".equalsIgnoreCase(status) || "Disabled".equalsIgnoreCase(status)) {
            return disabled;
        }
        return !disabled;
    }

    private String formatUsDate(LocalDate date) {
        return date == null ? "" : date.format(US_DATE_FMT);
    }

    private List<Map<String, Object>> homeworkReport(String reportKey,
                                                     Long classId,
                                                     String section,
                                                     Long subjectGroupId,
                                                     Long subjectId,
                                                     String searchType) {
        return switch (reportKey.toLowerCase()) {
            case "homeworkreport" -> homeworkSummaryRows(classId, section, subjectGroupId, subjectId);
            case "evaluation_report", "homeworkevaluationreport" ->
                    homeworkEvaluationRows(classId, section, subjectGroupId, subjectId);
            case "homeworkordailyassignmentreport", "dailyassignmentreport" ->
                    dailyAssignmentSummaryRows(classId, section, subjectGroupId, subjectId, searchType);
            case "homeworksmarksreport", "homeworkmarksreport" ->
                    homeworkMarksRows(classId, section, subjectGroupId, subjectId);
            default -> List.of();
        };
    }

    private List<Homework> filteredHomework(Long classId, String section, Long subjectGroupId, Long subjectId) {
        return homeworkRepository.findByIsActiveTrueOrderByHomeworkDateDescCreatedAtDesc().stream()
                .filter(hw -> classId == null || Objects.equals(hw.getClassId(), classId))
                .filter(hw -> section == null || section.isBlank()
                        || section.equalsIgnoreCase(text(hw.getSection())))
                .filter(hw -> subjectGroupId == null || Objects.equals(hw.getSubjectGroupId(), subjectGroupId))
                .filter(hw -> subjectId == null || Objects.equals(hw.getSubjectId(), subjectId))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> homeworkSummaryRows(Long classId, String section,
                                                          Long subjectGroupId, Long subjectId) {
        return filteredHomework(classId, section, subjectGroupId, subjectId).stream()
                .map(hw -> {
                    int studentCount = countStudentsInClassSection(hw.getClassId(), hw.getSection());
                    List<HomeworkStudentEvaluation> evaluations = homeworkStudentEvaluationRepository
                            .findByHomeworkIdAndIsActiveTrueOrderByStudentNameAsc(hw.getId());
                    long submitted = evaluations.stream().filter(this::isHomeworkSubmitted).count();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("className", text(hw.getClassName()));
                    row.put("section", text(hw.getSection()));
                    row.put("subjectGroup", text(hw.getSubjectGroupName()));
                    row.put("subject", text(hw.getSubjectName()));
                    row.put("homeworkDate", formatDate(hw.getHomeworkDate()));
                    row.put("submissionDate", formatDate(hw.getSubmissionDate()));
                    row.put("studentCount", studentCount);
                    row.put("homeworkSubmitted", submitted);
                    row.put("pendingStudent", Math.max(0, studentCount - (int) submitted));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> homeworkEvaluationRows(Long classId, String section,
                                                             Long subjectGroupId, Long subjectId) {
        return filteredHomework(classId, section, subjectGroupId, subjectId).stream()
                .map(hw -> {
                    int studentCount = countStudentsInClassSection(hw.getClassId(), hw.getSection());
                    List<HomeworkStudentEvaluation> evaluations = homeworkStudentEvaluationRepository
                            .findByHomeworkIdAndIsActiveTrueOrderByStudentNameAsc(hw.getId());
                    long complete = evaluations.stream().filter(this::isHomeworkSubmitted).count();
                    long incomplete = Math.max(0, studentCount - complete);
                    double completePercent = studentCount == 0 ? 0.0 : (complete * 100.0) / studentCount;

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("subject", text(hw.getSubjectName()));
                    row.put("homeworkDate", formatDate(hw.getHomeworkDate()));
                    row.put("submissionDate", formatDate(hw.getSubmissionDate()));
                    row.put("completeIncomplete", complete + " / " + incomplete);
                    row.put("completePercent", String.format(Locale.ROOT, "%.2f", completePercent));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> dailyAssignmentSummaryRows(Long classId, String section,
                                                                 Long subjectGroupId, Long subjectId,
                                                                 String searchType) {
        LocalDate[] range = resolveFinanceSearchRange(searchType);
        if (range == null) {
            LocalDate today = LocalDate.now();
            range = new LocalDate[]{today.withDayOfYear(1), today};
        }

        LocalDate from = range[0];
        LocalDate to = range[1];

        Map<Long, List<DailyAssignment>> grouped = dailyAssignmentRepository
                .findByIsActiveTrueOrderByAssignmentDateDescCreatedAtDesc().stream()
                .filter(assignment -> classId == null || Objects.equals(assignment.getClassId(), classId))
                .filter(assignment -> section == null || section.isBlank()
                        || section.equalsIgnoreCase(text(assignment.getSection())))
                .filter(assignment -> subjectGroupId == null
                        || Objects.equals(assignment.getSubjectGroupId(), subjectGroupId))
                .filter(assignment -> subjectId == null || Objects.equals(assignment.getSubjectId(), subjectId))
                .filter(assignment -> inDateRange(assignment.getAssignmentDate(), from, to))
                .collect(Collectors.groupingBy(DailyAssignment::getStudentAdmissionId, LinkedHashMap::new,
                        Collectors.toList()));

        return grouped.values().stream()
                .map(assignments -> {
                    DailyAssignment first = assignments.get(0);
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("studentName", text(first.getStudentName()));
                    row.put("className", text(first.getClassName()));
                    row.put("section", text(first.getSection()));
                    row.put("totalAssignment", assignments.size());
                    row.put("studentAdmissionId", first.getStudentAdmissionId());
                    return row;
                })
                .sorted(Comparator.comparing(row -> text(row.get("studentName")), String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> homeworkMarksRows(Long classId, String section,
                                                         Long subjectGroupId, Long subjectId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Homework hw : filteredHomework(classId, section, subjectGroupId, subjectId)) {
            List<HomeworkStudentEvaluation> evaluations = homeworkStudentEvaluationRepository
                    .findByHomeworkIdAndIsActiveTrueOrderByStudentNameAsc(hw.getId());
            for (HomeworkStudentEvaluation evaluation : evaluations) {
                StudentAdmission student = studentAdmissionRepository.findById(evaluation.getStudentAdmissionId())
                        .orElse(null);
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("admissionNo", student != null ? text(student.getAdmissionNo()) : "");
                row.put("studentName", text(evaluation.getStudentName()));
                row.put("rollNumber", student != null ? text(student.getRollNumber()) : "");
                row.put("homeworkDate", formatDate(hw.getHomeworkDate()));
                row.put("submissionDate", formatDate(hw.getSubmissionDate()));
                row.put("evaluationDate", formatDate(hw.getEvaluationDate()));
                row.put("totalMarks", hw.getMaxMarks() != null ? hw.getMaxMarks() : "");
                row.put("marksObtained", evaluation.getMarks() != null ? evaluation.getMarks() : "");
                row.put("note", text(evaluation.getMessage()));
                rows.add(row);
            }
        }
        return rows;
    }

    private int countStudentsInClassSection(Long classId, String section) {
        return studentAdmissionRepository.search(classId, section, null, false, null).size();
    }

    private boolean isHomeworkSubmitted(HomeworkStudentEvaluation evaluation) {
        if (evaluation == null) {
            return false;
        }
        if (evaluation.getMarks() != null) {
            return true;
        }
        if (evaluation.getDocumentPath() != null && !evaluation.getDocumentPath().isBlank()) {
            return true;
        }
        return evaluation.getMessage() != null && !evaluation.getMessage().isBlank();
    }

    private List<Map<String, Object>> libraryReport(String reportKey, String searchType, String memberType) {
        return switch (reportKey.toLowerCase()) {
            case "studentbookissuereport", "bookissuereport" -> bookIssueReportRows(searchType, memberType, false);
            case "bookduereport" -> bookIssueReportRows(searchType, memberType, true);
            case "bookinventory", "bookinventoryreport" -> bookInventoryReportRows(searchType);
            case "issuereturnreport", "bookissuereturnreport" -> bookIssueReturnReportRows(searchType);
            default -> List.of();
        };
    }

    private List<Map<String, Object>> bookIssueReportRows(String searchType, String memberType, boolean dueOnly) {
        LocalDate[] range = resolveLibrarySearchRange(searchType);
        return libraryBookIssueRepository.findAllActiveWithDetails().stream()
                .filter(issue -> range == null || inDateRange(issue.getIssueDate(), range[0], range[1]))
                .filter(issue -> !dueOnly || issue.getReturnDate() == null)
                .filter(issue -> matchesLibraryMemberType(issue.getMember(), memberType))
                .map(this::bookIssueReportRow)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> bookIssueReturnReportRows(String searchType) {
        LocalDate[] range = resolveLibrarySearchRange(searchType);
        return libraryBookIssueRepository.findAllActiveWithDetails().stream()
                .filter(issue -> issue.getReturnDate() != null)
                .filter(issue -> range == null || inDateRange(issue.getReturnDate(), range[0], range[1]))
                .map(this::bookIssueReturnReportRow)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> bookInventoryReportRows(String searchType) {
        LocalDate[] range = resolveLibrarySearchRange(searchType);
        return libraryRepository.findAllByOrderByIdDesc().stream()
                .filter(book -> Boolean.TRUE.equals(book.getIsActive()))
                .filter(book -> {
                    if (range == null) {
                        return true;
                    }
                    LocalDate postDate = book.getPostDate();
                    return postDate != null && !postDate.isBefore(range[0]) && !postDate.isAfter(range[1]);
                })
                .map(this::bookInventoryReportRow)
                .collect(Collectors.toList());
    }

    private Map<String, Object> bookIssueReportRow(LibraryBookIssue issue) {
        LibraryMember member = issue.getMember();
        Library book = issue.getBook();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("bookTitle", book != null ? text(book.getTitle()) : "");
        row.put("bookNumber", book != null ? text(book.getBookNumber()) : "");
        row.put("issueDate", formatUsDate(issue.getIssueDate()));
        row.put("dueReturnDate", formatUsDate(issue.getDueDate()));
        row.put("memberId", member != null ? member.getId() : "");
        row.put("libraryCardNumber", member != null ? text(member.getLibraryCardNo()) : "");
        row.put("admissionNo", resolveMemberAdmissionNo(member));
        row.put("issueBy", resolveLibraryIssueBy(member));
        row.put("membersType", member != null ? text(member.getMemberType()) : "");
        return row;
    }

    private Map<String, Object> bookIssueReturnReportRow(LibraryBookIssue issue) {
        LibraryMember member = issue.getMember();
        Library book = issue.getBook();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("bookTitle", book != null ? text(book.getTitle()) : "");
        row.put("bookNumber", book != null ? text(book.getBookNumber()) : "");
        row.put("issueDate", formatUsDate(issue.getIssueDate()));
        row.put("returnDate", formatUsDate(issue.getReturnDate()));
        row.put("memberId", member != null ? member.getId() : "");
        row.put("libraryCardNo", member != null ? text(member.getLibraryCardNo()) : "");
        row.put("issueBy", resolveLibraryIssueBy(member));
        row.put("memberType", member != null ? text(member.getMemberType()) : "");
        return row;
    }

    private Map<String, Object> bookInventoryReportRow(Library book) {
        int qty = book.getTotalCopies() != null ? book.getTotalCopies() : 0;
        int available = book.getAvailableCopies() != null ? book.getAvailableCopies() : 0;
        int issued = Math.max(0, qty - available);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("bookTitle", text(book.getTitle()));
        row.put("bookNumber", text(book.getBookNumber()));
        row.put("isbnNumber", text(book.getIsbn()));
        row.put("publisher", text(book.getPublisher()));
        row.put("author", text(book.getAuthor()));
        row.put("subject", text(book.getSubject()));
        row.put("rackNumber", text(book.getRackNumber()));
        row.put("qty", qty);
        row.put("available", available);
        row.put("issued", issued);
        row.put("bookPrice", book.getBookPrice() != null
                ? appCurrencyService.formatCurrency(book.getBookPrice()) : "");
        row.put("postDate", formatUsDate(book.getPostDate()));
        return row;
    }

    private LocalDate[] resolveLibrarySearchRange(String searchType) {
        if (searchType == null || searchType.isBlank() || "all".equalsIgnoreCase(searchType)) {
            return null;
        }
        return resolveFinanceSearchRange(searchType);
    }

    private boolean matchesLibraryMemberType(LibraryMember member, String memberType) {
        if (memberType == null || memberType.isBlank() || "All".equalsIgnoreCase(memberType)) {
            return true;
        }
        return member != null && memberType.equalsIgnoreCase(text(member.getMemberType()));
    }

    private String resolveMemberAdmissionNo(LibraryMember member) {
        if (member == null || member.getStudentAdmission() == null) {
            return "";
        }
        return text(member.getStudentAdmission().getAdmissionNo());
    }

    private String resolveLibraryIssueBy(LibraryMember member) {
        if (member == null) {
            return "";
        }
        if (member.getStudentAdmission() != null) {
            StudentAdmission student = member.getStudentAdmission();
            String name = studentFullName(student);
            String admissionNo = text(student.getAdmissionNo());
            return name + (admissionNo.isBlank() ? "" : " (" + admissionNo + ")");
        }
        if (member.getStaffMember() != null) {
            StaffMember staff = member.getStaffMember();
            String name = staffFullName(staff);
            String staffId = text(staff.getStaffId());
            return name + (staffId.isBlank() ? "" : " (" + staffId + ")");
        }
        return text(member.getLibraryCardNo());
    }

    private List<Map<String, Object>> inventoryReport(String reportKey, String searchType) {
        return switch (reportKey.toLowerCase()) {
            case "inventorystock", "stockreport" -> inventoryStockReportRows(searchType);
            case "additem", "itemreport" -> inventoryAddItemReportRows(searchType);
            case "issueinventory", "issuereport" -> inventoryIssueReportRows(searchType);
            default -> List.of();
        };
    }

    private List<Map<String, Object>> inventoryStockReportRows(String searchType) {
        Map<Long, Integer> issuedByItem = computeIssuedQuantitiesByItem();
        Map<Long, InventoryItemStock> latestStockByItem = latestStockByItem();

        return inventoryItemRepository.findAllWithCategory().stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .filter(item -> matchesInventoryItemActivity(item.getId(), searchType))
                .map(item -> {
                    int issued = issuedByItem.getOrDefault(item.getId(), 0);
                    int available = item.getAvailableQuantity() != null ? item.getAvailableQuantity() : 0;
                    int total = available + issued;
                    InventoryItemStock latestStock = latestStockByItem.get(item.getId());

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", text(item.getName()));
                    row.put("category", item.getCategory() != null ? text(item.getCategory().getName()) : "");
                    row.put("supplier", latestStock != null && latestStock.getSupplier() != null
                            ? text(latestStock.getSupplier().getName()) : "");
                    row.put("store", latestStock != null && latestStock.getStore() != null
                            ? text(latestStock.getStore().getName()) : "");
                    row.put("availableQuantity", available);
                    row.put("totalQuantity", total);
                    row.put("totalIssued", issued);
                    return row;
                })
                .sorted(Comparator.comparing(row -> text(row.get("name")), String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> inventoryAddItemReportRows(String searchType) {
        LocalDate[] range = resolveLibrarySearchRange(searchType);
        return inventoryItemStockRepository.findAllWithDetails().stream()
                .filter(stock -> Boolean.TRUE.equals(stock.getIsActive()))
                .filter(stock -> range == null || inDateRange(stock.getStockDate(), range[0], range[1]))
                .map(stock -> {
                    InventoryItem item = stock.getItem();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", item != null ? text(item.getName()) : "");
                    row.put("category", item != null && item.getCategory() != null
                            ? text(item.getCategory().getName()) : "");
                    row.put("supplier", stock.getSupplier() != null ? text(stock.getSupplier().getName()) : "");
                    row.put("store", stock.getStore() != null ? text(stock.getStore().getName()) : "");
                    row.put("quantity", stock.getQuantity());
                    row.put("purchasePrice", stock.getPurchasePrice() != null
                            ? appCurrencyService.formatCurrency(stock.getPurchasePrice()) : "");
                    row.put("date", formatUsDate(stock.getStockDate()));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> inventoryIssueReportRows(String searchType) {
        LocalDate[] range = resolveLibrarySearchRange(searchType);
        return inventoryIssueItemRepository.findAllWithDetails().stream()
                .filter(issue -> Boolean.TRUE.equals(issue.getIsActive()))
                .filter(issue -> range == null || inDateRange(issue.getIssueDate(), range[0], range[1]))
                .map(this::inventoryIssueReportRow)
                .collect(Collectors.toList());
    }

    private Map<String, Object> inventoryIssueReportRow(InventoryIssueItem issue) {
        InventoryItem item = issue.getItem();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("item", item != null ? text(item.getName()) : "");
        row.put("note", text(issue.getNote()));
        row.put("itemCategory", item != null && item.getCategory() != null
                ? text(item.getCategory().getName()) : "");
        row.put("issueReturn", formatUsDate(issue.getIssueDate())
                + (issue.getReturnDate() != null ? " - " + formatUsDate(issue.getReturnDate()) : ""));
        row.put("issueTo", formatInventoryPerson(issue.getIssueToName(), issue.getIssueToCode()));
        row.put("issuedBy", issue.getIssuedBy() != null
                ? formatInventoryPerson(staffFullName(issue.getIssuedBy()), issue.getIssuedBy().getStaffId()) : "");
        row.put("quantity", issue.getQuantity());
        return row;
    }

    private Map<Long, Integer> computeIssuedQuantitiesByItem() {
        Map<Long, Integer> totals = new HashMap<>();
        for (InventoryIssueItem issue : inventoryIssueItemRepository.findAllWithDetails()) {
            if (!Boolean.TRUE.equals(issue.getIsActive()) || issue.getItem() == null) {
                continue;
            }
            if ("Returned".equalsIgnoreCase(text(issue.getStatus()))) {
                continue;
            }
            int qty = issue.getQuantity() != null ? issue.getQuantity() : 0;
            totals.merge(issue.getItem().getId(), qty, Integer::sum);
        }
        return totals;
    }

    private Map<Long, InventoryItemStock> latestStockByItem() {
        Map<Long, InventoryItemStock> latest = new HashMap<>();
        for (InventoryItemStock stock : inventoryItemStockRepository.findAllWithDetails()) {
            if (!Boolean.TRUE.equals(stock.getIsActive()) || stock.getItem() == null) {
                continue;
            }
            Long itemId = stock.getItem().getId();
            InventoryItemStock existing = latest.get(itemId);
            if (existing == null || (stock.getStockDate() != null && existing.getStockDate() != null
                    && stock.getStockDate().isAfter(existing.getStockDate()))) {
                latest.put(itemId, stock);
            } else if (existing.getStockDate() == null) {
                latest.put(itemId, stock);
            }
        }
        return latest;
    }

    private boolean matchesInventoryItemActivity(Long itemId, String searchType) {
        LocalDate[] range = resolveLibrarySearchRange(searchType);
        if (range == null) {
            return true;
        }
        boolean stockActivity = inventoryItemStockRepository.findAllWithDetails().stream()
                .anyMatch(stock -> stock.getItem() != null
                        && Objects.equals(stock.getItem().getId(), itemId)
                        && Boolean.TRUE.equals(stock.getIsActive())
                        && inDateRange(stock.getStockDate(), range[0], range[1]));
        if (stockActivity) {
            return true;
        }
        return inventoryIssueItemRepository.findAllWithDetails().stream()
                .anyMatch(issue -> issue.getItem() != null
                        && Objects.equals(issue.getItem().getId(), itemId)
                        && Boolean.TRUE.equals(issue.getIsActive())
                        && inDateRange(issue.getIssueDate(), range[0], range[1]));
    }

    private String formatInventoryPerson(String name, String code) {
        String displayName = text(name);
        String displayCode = text(code);
        if (displayCode.isBlank()) {
            return displayName;
        }
        return displayName + "(" + displayCode + ")";
    }

    private List<Map<String, Object>> transportReport(String reportKey,
                                                      Long classId,
                                                      String section,
                                                      String routeFilter,
                                                      String pickupFilter,
                                                      String vehicleFilter) {
        if ("routereport".equalsIgnoreCase(reportKey)) {
            return transportRouteRepository.findAll().stream()
                    .map(route -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("routeTitle", text(route.getTitle()));
                        return row;
                    })
                    .collect(Collectors.toList());
        }
        if ("studenttransportdetails".equalsIgnoreCase(reportKey)
                || "studenttransportreport".equalsIgnoreCase(reportKey)) {
            return studentTransportDetailsReport(classId, section, routeFilter, pickupFilter, vehicleFilter);
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

    private List<Map<String, Object>> studentTransportDetailsReport(Long classId,
                                                                     String section,
                                                                     String routeFilter,
                                                                     String pickupFilter,
                                                                     String vehicleFilter) {
        Map<String, List<TransportRouteVehicle>> vehiclesByRoute = new HashMap<>();
        for (TransportRouteVehicle assignment : transportRouteVehicleRepository.findAllWithDetails()) {
            String routeTitle = text(assignment.getRoute().getTitle());
            vehiclesByRoute.computeIfAbsent(routeTitle.toLowerCase(Locale.ROOT), key -> new ArrayList<>())
                    .add(assignment);
        }

        Map<String, BigDecimal> feesByRoutePickup = new HashMap<>();
        for (TransportRouteStop stop : transportRouteStopRepository.findAllWithDetails()) {
            String key = transportStopKey(text(stop.getRoute().getTitle()), text(stop.getPickupPoint().getName()));
            if (stop.getMonthlyFees() != null) {
                feesByRoutePickup.put(key, stop.getMonthlyFees());
            }
        }

        String routeFilterText = text(routeFilter);
        String pickupFilterText = text(pickupFilter);
        String vehicleFilterText = text(vehicleFilter);

        return loadStudents(classId, section, null, null, null).stream()
                .filter(student -> matchesTransportStudentFilters(
                        student, routeFilterText, pickupFilterText, vehicleFilterText, vehiclesByRoute))
                .map(student -> transportStudentRow(student, vehiclesByRoute, feesByRoutePickup, vehicleFilterText))
                .collect(Collectors.toList());
    }

    private Map<String, Object> transportStudentRow(StudentAdmission student,
                                                     Map<String, List<TransportRouteVehicle>> vehiclesByRoute,
                                                     Map<String, BigDecimal> feesByRoutePickup,
                                                     String vehicleFilterText) {
        String routeTitle = text(student.getRouteList());
        String pickupPoint = text(student.getPickupPoint());
        List<TransportRouteVehicle> assignments = vehiclesByRoute.getOrDefault(
                routeTitle.toLowerCase(Locale.ROOT), List.of());

        TransportVehicle vehicle = resolveTransportVehicle(assignments, vehicleFilterText);
        BigDecimal fare = feesByRoutePickup.getOrDefault(
                transportStopKey(routeTitle, pickupPoint), BigDecimal.ZERO);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("className", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
        row.put("admissionNo", text(student.getAdmissionNo()));
        row.put("studentName", studentFullName(student));
        row.put("mobileNumber", text(student.getMobileNumber()));
        row.put("fatherName", text(student.getFatherName()));
        row.put("routeTitle", routeTitle);
        row.put("vehicleNumber", vehicle != null ? text(vehicle.getVehicleNumber()) : vehicleNumbersForRoute(assignments));
        row.put("pickupPoint", pickupPoint);
        row.put("driverName", vehicle != null ? text(vehicle.getDriverName()) : driverNamesForRoute(assignments));
        row.put("driverContact", vehicle != null ? text(vehicle.getDriverContact()) : driverContactsForRoute(assignments));
        row.put("fare", fare);
        return row;
    }

    private boolean matchesTransportStudentFilters(StudentAdmission student,
                                                   String routeFilter,
                                                   String pickupFilter,
                                                   String vehicleFilter,
                                                   Map<String, List<TransportRouteVehicle>> vehiclesByRoute) {
        String routeTitle = text(student.getRouteList());
        if (routeTitle.isBlank()) {
            return false;
        }
        if (!routeFilter.isBlank() && !routeTitle.equalsIgnoreCase(routeFilter)) {
            return false;
        }
        String pickupPoint = text(student.getPickupPoint());
        if (!pickupFilter.isBlank() && !pickupPoint.equalsIgnoreCase(pickupFilter)) {
            return false;
        }
        if (!vehicleFilter.isBlank()) {
            List<TransportRouteVehicle> assignments = vehiclesByRoute.getOrDefault(
                    routeTitle.toLowerCase(Locale.ROOT), List.of());
            boolean matchesVehicle = assignments.stream()
                    .map(TransportRouteVehicle::getVehicle)
                    .filter(Objects::nonNull)
                    .anyMatch(vehicle -> vehicleFilter.equalsIgnoreCase(text(vehicle.getVehicleNumber())));
            if (!matchesVehicle) {
                return false;
            }
        }
        return true;
    }

    private TransportVehicle resolveTransportVehicle(List<TransportRouteVehicle> assignments, String vehicleFilterText) {
        if (assignments.isEmpty()) {
            return null;
        }
        if (!vehicleFilterText.isBlank()) {
            for (TransportRouteVehicle assignment : assignments) {
                TransportVehicle vehicle = assignment.getVehicle();
                if (vehicle != null && vehicleFilterText.equalsIgnoreCase(text(vehicle.getVehicleNumber()))) {
                    return vehicle;
                }
            }
        }
        TransportVehicle first = assignments.get(0).getVehicle();
        return first != null ? first : null;
    }

    private String vehicleNumbersForRoute(List<TransportRouteVehicle> assignments) {
        return assignments.stream()
                .map(TransportRouteVehicle::getVehicle)
                .filter(Objects::nonNull)
                .map(vehicle -> text(vehicle.getVehicleNumber()))
                .filter(number -> !number.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
    }

    private String driverNamesForRoute(List<TransportRouteVehicle> assignments) {
        return assignments.stream()
                .map(TransportRouteVehicle::getVehicle)
                .filter(Objects::nonNull)
                .map(vehicle -> text(vehicle.getDriverName()))
                .filter(name -> !name.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
    }

    private String driverContactsForRoute(List<TransportRouteVehicle> assignments) {
        return assignments.stream()
                .map(TransportRouteVehicle::getVehicle)
                .filter(Objects::nonNull)
                .map(vehicle -> text(vehicle.getDriverContact()))
                .filter(contact -> !contact.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
    }

    private String transportStopKey(String routeTitle, String pickupPoint) {
        return routeTitle.toLowerCase(Locale.ROOT) + "|" + pickupPoint.toLowerCase(Locale.ROOT);
    }

    private List<Map<String, Object>> hostelReport(String reportKey, Long classId, String section, Long hostelId) {
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
        return loadStudents(classId, section, null, null, null).stream()
                .filter(student -> student.getHostel() != null)
                .filter(student -> hostelId == null || (student.getHostel() != null
                        && Objects.equals(student.getHostel().getId(), hostelId)))
                .map(student -> hostelStudentRow(student))
                .collect(Collectors.toList());
    }

    private Map<String, Object> hostelStudentRow(StudentAdmission student) {
        String className = student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "";
        String section = text(student.getSection());
        String classSection = section.isBlank() ? className : className + " - " + section;

        HostelRoom room = student.getHostelRoom();
        String roomNumber = room != null ? text(room.getRoomNumber()) : "";
        String roomType = room != null && room.getRoomType() != null ? text(room.getRoomType().getRoomType()) : "";
        BigDecimal costPerBed = room != null && room.getCostPerBed() != null ? room.getCostPerBed() : BigDecimal.ZERO;

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("classSection", classSection);
        row.put("admissionNo", text(student.getAdmissionNo()));
        row.put("studentName", studentFullName(student));
        row.put("mobileNumber", text(student.getMobileNumber()));
        row.put("guardianPhone", text(student.getGuardianPhone()));
        row.put("hostelName", text(student.getHostel().getHostelName()));
        row.put("roomNumberName", roomNumber);
        row.put("roomType", roomType);
        row.put("costPerBed", costPerBed);
        return row;
    }

    private List<Map<String, Object>> alumniReport(String reportKey,
                                                   Long classId,
                                                   String section,
                                                   Long sessionId,
                                                   LocalDate dateFrom,
                                                   LocalDate dateTo) {
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
        return alumniService.search(sessionId, classId, section, null).stream()
                .map(this::alumniReportRow)
                .collect(Collectors.toList());
    }

    private Map<String, Object> alumniReportRow(Map<String, Object> alumni) {
        String className = text(alumni.get("className"));
        String sectionName = text(alumni.get("sectionName"));
        String classSection = sectionName.isBlank() ? className : className + " - " + sectionName;

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("passOutSession", text(alumni.get("sessionName")));
        row.put("classSection", classSection);
        row.put("admissionNumber", text(alumni.get("admissionNumber")));
        row.put("studentName", text(alumni.get("studentName")));
        row.put("mobileNumber", text(alumni.get("currentPhone")));
        row.put("email", text(alumni.get("currentEmail")));
        row.put("gender", text(alumni.get("gender")));
        row.put("occupation", text(alumni.get("occupation")));
        row.put("address", text(alumni.get("address")));
        return row;
    }

    private List<Map<String, Object>> userLogReport(LocalDate dateFrom, LocalDate dateTo) {
        return userLogService.listLogs("all");
    }

    private List<Map<String, Object>> auditTrailReport(LocalDate dateFrom, LocalDate dateTo) {
        return auditTrailService.listRecords();
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

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
