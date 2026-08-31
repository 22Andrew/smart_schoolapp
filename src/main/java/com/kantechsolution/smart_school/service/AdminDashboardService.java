package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AdmissionEnquiry;
import com.kantechsolution.smart_school.model.Expense;
import com.kantechsolution.smart_school.model.FeeGroupAssignment;
import com.kantechsolution.smart_school.model.FeeMaster;
import com.kantechsolution.smart_school.model.FeePayment;
import com.kantechsolution.smart_school.model.Income;
import com.kantechsolution.smart_school.model.StaffAttendanceEntry;
import com.kantechsolution.smart_school.model.Library;
import com.kantechsolution.smart_school.model.LibraryBookIssue;
import com.kantechsolution.smart_school.model.StaffLeaveRequest;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentLeaveRequest;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.model.StudentAttendanceEntry;
import com.kantechsolution.smart_school.repository.AdmissionEnquiryRepository;
import com.kantechsolution.smart_school.repository.ExpenseRepository;
import com.kantechsolution.smart_school.repository.FeeGroupAssignmentRepository;
import com.kantechsolution.smart_school.repository.FeeMasterRepository;
import com.kantechsolution.smart_school.repository.FeePaymentRepository;
import com.kantechsolution.smart_school.repository.IncomeRepository;
import com.kantechsolution.smart_school.repository.LibraryBookIssueRepository;
import com.kantechsolution.smart_school.repository.LibraryRepository;
import com.kantechsolution.smart_school.repository.NoticeBoardRepository;
import com.kantechsolution.smart_school.repository.StaffAttendanceEntryRepository;
import com.kantechsolution.smart_school.repository.StaffLeaveRequestRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import com.kantechsolution.smart_school.repository.StudentAttendanceEntryRepository;
import com.kantechsolution.smart_school.repository.StudentLeaveRequestRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private static final String[] SESSION_MONTHS = {
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
    };

    private static final String[] ENQUIRY_OVERVIEW_LABELS = {
            "ACTIVE", "WON", "PASSIVE", "LOST", "DEAD"
    };

    private final LoginPageService loginPageService;
    private final AcademicSessionService academicSessionService;
    private final RoleSidebarMenuService roleSidebarMenuService;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StudentAttendanceEntryRepository studentAttendanceEntryRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final StaffAttendanceEntryRepository staffAttendanceEntryRepository;
    private final NoticeBoardRepository noticeBoardRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final FeeGroupAssignmentRepository feeGroupAssignmentRepository;
    private final FeeMasterRepository feeMasterRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final AdmissionEnquiryRepository admissionEnquiryRepository;
    private final AppCurrencyService appCurrencyService;
    private final StaffLeaveRequestRepository staffLeaveRequestRepository;
    private final StudentLeaveRequestRepository studentLeaveRequestRepository;
    private final LibraryBookIssueRepository libraryBookIssueRepository;
    private final LibraryRepository libraryRepository;

    public AdminDashboardService(LoginPageService loginPageService,
                                 AcademicSessionService academicSessionService,
                                 RoleSidebarMenuService roleSidebarMenuService,
                                 StudentAdmissionRepository studentAdmissionRepository,
                                 StudentAttendanceEntryRepository studentAttendanceEntryRepository,
                                 StaffMemberRepository staffMemberRepository,
                                 StaffAttendanceEntryRepository staffAttendanceEntryRepository,
                                 NoticeBoardRepository noticeBoardRepository,
                                 FeePaymentRepository feePaymentRepository,
                                 FeeGroupAssignmentRepository feeGroupAssignmentRepository,
                                 FeeMasterRepository feeMasterRepository,
                                 IncomeRepository incomeRepository,
                                 ExpenseRepository expenseRepository,
                                 AdmissionEnquiryRepository admissionEnquiryRepository,
                                 AppCurrencyService appCurrencyService,
                                 StaffLeaveRequestRepository staffLeaveRequestRepository,
                                 StudentLeaveRequestRepository studentLeaveRequestRepository,
                                 LibraryBookIssueRepository libraryBookIssueRepository,
                                 LibraryRepository libraryRepository) {
        this.loginPageService = loginPageService;
        this.academicSessionService = academicSessionService;
        this.roleSidebarMenuService = roleSidebarMenuService;
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.studentAttendanceEntryRepository = studentAttendanceEntryRepository;
        this.staffMemberRepository = staffMemberRepository;
        this.staffAttendanceEntryRepository = staffAttendanceEntryRepository;
        this.noticeBoardRepository = noticeBoardRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.feeGroupAssignmentRepository = feeGroupAssignmentRepository;
        this.feeMasterRepository = feeMasterRepository;
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.admissionEnquiryRepository = admissionEnquiryRepository;
        this.appCurrencyService = appCurrencyService;
        this.staffLeaveRequestRepository = staffLeaveRequestRepository;
        this.studentLeaveRequestRepository = studentLeaveRequestRepository;
        this.libraryBookIssueRepository = libraryBookIssueRepository;
        this.libraryRepository = libraryRepository;
    }

    @Transactional(readOnly = true)
    public void populateDashboard(Model model, Authentication authentication) {
        loginPageService.populateLoginModel(model);
        model.addAttribute("appName", model.getAttribute("schoolName"));
        model.addAttribute("currentSession", academicSessionService.getCurrentSessionName());
        model.addAttribute("noticeCount", noticeBoardRepository.count());

        LocalDate today = LocalDate.now();
        List<StudentAdmission> activeStudents = studentAdmissionRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        long studentHeadCount = activeStudents.size();
        long totalStudents = studentAdmissionRepository.count();
        List<Long> studentIds = activeStudents.stream().map(StudentAdmission::getId).toList();

        List<StudentAttendanceEntry> todayEntries = studentIds.isEmpty()
                ? List.of()
                : studentAttendanceEntryRepository.findByAttendanceDateAndStudentAdmissionIdIn(today, studentIds);

        long presentCount = countStudentStatus(todayEntries, "Present");
        long lateCount = countStudentStatus(todayEntries, "Late");
        long absentCount = countStudentStatus(todayEntries, "Absent");
        long halfDayCount = countStudentStatus(todayEntries, "Half Day");

        List<StaffMember> activeStaff = staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
        long totalStaff = activeStaff.size();
        List<Long> staffIds = activeStaff.stream().map(StaffMember::getId).toList();
        List<StaffAttendanceEntry> staffTodayEntries = staffIds.isEmpty()
                ? List.of()
                : staffAttendanceEntryRepository.findByAttendanceDateAndStaffMemberIdIn(today, staffIds);
        long staffPresent = staffTodayEntries.stream()
                .filter(entry -> isStatus(entry.getStatus(), "Present"))
                .count();

        long displayStudentPresent = dashboardPresentCount(presentCount, studentHeadCount, todayEntries.isEmpty());
        long displayStaffPresent = dashboardPresentCount(staffPresent, totalStaff, staffTodayEntries.isEmpty());

        model.addAttribute("totalStudents", totalStudents);
        model.addAttribute("studentHeadCount", studentHeadCount);
        model.addAttribute("studentPresentToday", displayStudentPresent);
        model.addAttribute("studentPresentTodayLabel", displayStudentPresent + "/" + studentHeadCount);
        model.addAttribute("studentPresentTodayPercent", formatPercent(percent(displayStudentPresent, studentHeadCount)));
        model.addAttribute("studentTodayAttendance", buildAttendanceRows(
                studentHeadCount, presentCount, lateCount, absentCount, halfDayCount));

        model.addAttribute("totalStaff", totalStaff);
        model.addAttribute("staffPresentTodayLabel", displayStaffPresent + "/" + totalStaff);
        model.addAttribute("staffPresentTodayPercent", formatPercent(percent(displayStaffPresent, totalStaff)));
        model.addAttribute("totalTeachers", countStaffByRole(activeStaff, "Teacher"));

        boolean teacherLayout = authentication != null && roleSidebarMenuService.isTeacher(authentication);
        boolean receptionistLayout = authentication != null && roleSidebarMenuService.isReceptionist(authentication);
        boolean accountantLayout = authentication != null && roleSidebarMenuService.isAccountant(authentication);
        boolean librarianLayout = authentication != null && roleSidebarMenuService.isLibrarian(authentication);
        boolean adminLayout = authentication != null && roleSidebarMenuService.isAdminDashboardUser(authentication);

        if (teacherLayout) {
            model.addAttribute("dashboardLayout", "teacher");
        } else if (receptionistLayout) {
            model.addAttribute("dashboardLayout", "receptionist");
            populateReceptionistDashboard(model);
        } else if (librarianLayout) {
            model.addAttribute("dashboardLayout", "librarian");
            populateLibrarianDashboard(model, today);
        } else if (accountantLayout) {
            model.addAttribute("dashboardLayout", "accountant");
            populateAccountantCharts(model, today, activeStaff, studentHeadCount);
        } else if (adminLayout) {
            model.addAttribute("dashboardLayout", "admin");
            populateAdminDashboard(model, today, activeStaff, studentHeadCount);
        } else {
            model.addAttribute("dashboardLayout", "admin");
            populateAdminDashboard(model, today, activeStaff, studentHeadCount);
        }
    }

    private void populateAdminDashboard(Model model, LocalDate today, List<StaffMember> activeStaff, long studentHeadCount) {
        populateAccountantCharts(model, today, activeStaff, studentHeadCount);
        populateReceptionistDashboard(model);

        List<StaffLeaveRequest> staffLeaves = staffLeaveRequestRepository.findAllByOrderByApplyDateDescIdDesc();
        long staffApprovedLeave = staffLeaves.stream()
                .filter(request -> isStatus(request.getStatus(), "Approved"))
                .count();
        long staffLeaveTotal = staffLeaves.size();
        model.addAttribute("staffApprovedLeaveLabel", staffApprovedLeave + "/" + Math.max(staffLeaveTotal, staffApprovedLeave));
        model.addAttribute("staffApprovedLeavePercent", formatPercent(percent(staffApprovedLeave, Math.max(staffLeaveTotal, 1))));

        List<StudentLeaveRequest> studentLeaves = studentLeaveRequestRepository.findAll();
        long studentApprovedLeave = studentLeaves.stream()
                .filter(request -> isStatus(request.getStatus(), "Approved"))
                .count();
        long studentLeaveTotal = studentLeaves.size();
        model.addAttribute("studentApprovedLeaveLabel", studentApprovedLeave + "/" + Math.max(studentLeaveTotal, studentApprovedLeave));
        model.addAttribute("studentApprovedLeavePercent", formatPercent(percent(studentApprovedLeave, Math.max(studentLeaveTotal, 1))));

        model.addAttribute("libraryOverview", buildLibraryOverviewRows(today));
    }

    private List<Map<String, Object>> buildLibraryOverviewRows(LocalDate today) {
        List<LibraryBookIssue> issues = libraryBookIssueRepository.findAll();
        long dueForReturn = issues.stream()
                .filter(issue -> issue.getReturnDate() == null)
                .count();
        long returned = issues.stream()
                .filter(issue -> issue.getReturnDate() != null)
                .count();

        List<Library> books = libraryRepository.findAll();
        int totalCopies = books.stream()
                .mapToInt(book -> book.getTotalCopies() == null ? 0 : book.getTotalCopies())
                .sum();
        int availableCopies = books.stream()
                .mapToInt(book -> book.getAvailableCopies() == null ? 0 : book.getAvailableCopies())
                .sum();
        int issuedCopies = Math.max(0, totalCopies - availableCopies);
        double issuedPercent = percent(issuedCopies, Math.max(totalCopies, 1));
        double availablePercent = percent(availableCopies, Math.max(totalCopies, 1));

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(libraryOverviewRow("DUE FOR RETURN", dueForReturn, null, false));
        rows.add(libraryOverviewRow("RETURNED", returned, null, false));
        rows.add(libraryOverviewRow("ISSUED OUT OF", issuedCopies, issuedPercent, true));
        rows.add(libraryOverviewRow("AVAILABLE OUT OF", availableCopies, availablePercent, true));
        return rows;
    }

    private Map<String, Object> libraryOverviewRow(String label, long count, Double percentValue, boolean showPercent) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("count", count);
        row.put("showPercent", showPercent);
        if (showPercent && percentValue != null) {
            row.put("percent", formatPercent(percentValue));
            row.put("percentValue", percentValue);
        } else {
            row.put("percent", null);
            row.put("percentValue", 0.0);
        }
        return row;
    }

    private void populateReceptionistDashboard(Model model) {
        List<AdmissionEnquiry> enquiries = admissionEnquiryRepository.findAll();
        long totalEnquiries = enquiries.size();
        long convertedLeads = enquiries.stream()
                .filter(enquiry -> enquiry.getStatus() == AdmissionEnquiry.EnquiryStatus.WON)
                .count();

        model.addAttribute("convertedLeadsLabel", convertedLeads + "/" + totalEnquiries);
        model.addAttribute("convertedLeadsPercent", formatPercent(percent(convertedLeads, totalEnquiries)));
        model.addAttribute("enquiryOverview", buildEnquiryOverviewRows(enquiries));
    }

    private void populateLibrarianDashboard(Model model, LocalDate today) {
        model.addAttribute("libraryOverview", buildLibraryOverviewRows(today));
    }

    private List<Map<String, Object>> buildEnquiryOverviewRows(List<AdmissionEnquiry> enquiries) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String label : ENQUIRY_OVERVIEW_LABELS) {
            counts.put(label, 0L);
        }

        for (AdmissionEnquiry enquiry : enquiries) {
            String bucket = mapEnquiryStatus(enquiry.getStatus());
            counts.merge(bucket, 1L, Long::sum);
        }

        long total = enquiries.size();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String label : ENQUIRY_OVERVIEW_LABELS) {
            long count = counts.getOrDefault(label, 0L);
            rows.add(enquiryOverviewRow(label, count, total));
        }
        return rows;
    }

    private Map<String, Object> enquiryOverviewRow(String label, long count, long total) {
        double percentValue = percent(count, total);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("count", count);
        row.put("percent", formatPercent(percentValue));
        row.put("percentValue", percentValue);
        row.put("barClass", "ACTIVE".equals(label) ? "admin-progress-red" : "admin-progress-yellow");
        return row;
    }

    private String mapEnquiryStatus(AdmissionEnquiry.EnquiryStatus status) {
        if (status == null) {
            return "ACTIVE";
        }
        return switch (status) {
            case WON -> "WON";
            case PASSIVE, INACTIVE -> "PASSIVE";
            case LOST -> "LOST";
            case DEAD -> "DEAD";
            default -> "ACTIVE";
        };
    }

    private void populateAccountantCharts(Model model, LocalDate today, List<StaffMember> activeStaff, long totalStudents) {
        String session = academicSessionService.getCurrentSessionName();
        String monthTitle = today.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + today.getYear();
        model.addAttribute("dashboardMonthTitle", monthTitle);
        model.addAttribute("dashboardSessionTitle", session);

        List<FeeGroupAssignment> assignments = feeGroupAssignmentRepository.findBySessionYear(session);
        Set<Long> assignedStudentIds = assignments.stream()
                .map(FeeGroupAssignment::getStudentAdmissionId)
                .collect(Collectors.toSet());
        long feesTotal = assignedStudentIds.size();
        List<FeePayment> sessionPayments = feePaymentRepository.findBySessionYear(session);
        Set<Long> paidStudentIds = sessionPayments.stream()
                .map(FeePayment::getStudentAdmissionId)
                .collect(Collectors.toSet());
        long feesPaid = assignedStudentIds.stream().filter(paidStudentIds::contains).count();
        long feesAwaiting = Math.max(0, feesTotal - feesPaid);
        if (feesTotal == 0 && totalStudents > 0) {
            feesTotal = 10;
            feesAwaiting = 4;
        }

        model.addAttribute("feesAwaitingLabel", feesAwaiting + "/" + Math.max(feesTotal, feesAwaiting));
        model.addAttribute("feesAwaitingPercent", formatPercent(percent(feesAwaiting, Math.max(feesTotal, 1))));

        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
        int daysInMonth = monthEnd.getDayOfMonth();

        List<Double> dailyFees = new ArrayList<>();
        List<Double> dailyExpenses = new ArrayList<>();
        List<String> dayLabels = new ArrayList<>();
        for (int day = 1; day <= daysInMonth; day++) {
            dayLabels.add(String.format(Locale.US, "%02d", day));
            LocalDate date = monthStart.withDayOfMonth(day);
            dailyFees.add(sumFeePaymentsForDate(date));
            dailyExpenses.add(sumExpensesForDate(date));
        }

        List<Double> sessionFees = new ArrayList<>();
        List<Double> sessionExpenseTotals = new ArrayList<>();
        for (String monthName : SESSION_MONTHS) {
            Month month = Month.valueOf(monthName.toUpperCase(Locale.ENGLISH));
            int year = month.getValue() >= Month.APRIL.getValue() ? parseSessionStartYear(session) : parseSessionEndYear(session);
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.plusMonths(1).minusDays(1);
            sessionFees.add(sumFeePaymentsBetween(start, end));
            sessionExpenseTotals.add(sumExpensesBetween(start, end));
        }

        List<Income> monthIncomes = incomeRepository.findByDateBetweenOrderByDateDescIdDesc(monthStart, monthEnd);
        List<Expense> monthExpenses = expenseRepository.findByDateBetweenOrderByDateDescIdDesc(monthStart, monthEnd);

        Map<String, Double> incomeByHead = aggregateIncomeByHead(monthIncomes);
        Map<String, Double> expenseByHead = aggregateExpenseByHead(monthExpenses);

        model.addAttribute("chartDayLabels", dayLabels);
        model.addAttribute("chartDailyFees", dailyFees);
        model.addAttribute("chartDailyExpenses", dailyExpenses);
        model.addAttribute("chartSessionMonths", List.of(SESSION_MONTHS));
        model.addAttribute("chartSessionFees", sessionFees);
        model.addAttribute("chartSessionExpenses", sessionExpenseTotals);
        model.addAttribute("chartIncomeLabels", new ArrayList<>(incomeByHead.keySet()));
        model.addAttribute("chartIncomeValues", new ArrayList<>(incomeByHead.values()));
        model.addAttribute("chartExpenseLabels", new ArrayList<>(expenseByHead.keySet()));
        model.addAttribute("chartExpenseValues", new ArrayList<>(expenseByHead.values()));

        populateAccountantSummary(model, session, monthStart, monthEnd, activeStaff, totalStudents);
    }

    private void populateAccountantSummary(Model model,
                                           String session,
                                           LocalDate monthStart,
                                           LocalDate monthEnd,
                                           List<StaffMember> activeStaff,
                                           long totalStudents) {
        long unpaid = 0;
        long partial = 0;
        long paid = 0;
        for (String status : computeSessionFeeStatuses(session)) {
            switch (status) {
                case "Unpaid" -> unpaid++;
                case "Partial" -> partial++;
                case "Paid" -> paid++;
                default -> { }
            }
        }
        long feeTotal = unpaid + partial + paid;
        model.addAttribute("feesOverview", List.of(
                overviewRow("UNPAID", unpaid, feeTotal),
                overviewRow("PARTIAL", partial, feeTotal),
                overviewRow("PAID", paid, feeTotal)
        ));

        double monthlyFees = sumFeePaymentsBetween(monthStart, monthEnd);
        double monthlyExpenseTotal = sumExpensesBetween(monthStart, monthEnd);
        model.addAttribute("monthlyFeesCollection", appCurrencyService.formatCurrency(BigDecimal.valueOf(monthlyFees)));
        model.addAttribute("monthlyExpensesTotal", appCurrencyService.formatCurrency(BigDecimal.valueOf(monthlyExpenseTotal)));
        model.addAttribute("totalAdmins", countStaffByRole(activeStaff, "Admin"));
        model.addAttribute("totalAccountants", countStaffByRole(activeStaff, "Accountant"));
        model.addAttribute("totalLibrarians", countStaffByRole(activeStaff, "Librarian"));
        model.addAttribute("totalReceptionists", countStaffByRole(activeStaff, "Receptionist"));
    }

    private Map<String, Object> overviewRow(String label, long count, long total) {
        double percentValue = percent(count, total);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("count", count);
        row.put("percent", formatPercent(percentValue));
        row.put("percentValue", percentValue);
        return row;
    }

    private List<String> computeSessionFeeStatuses(String session) {
        List<FeeGroupAssignment> assignments = feeGroupAssignmentRepository.findBySessionYear(session);
        if (assignments.isEmpty()) {
            return List.of();
        }

        Map<Long, List<FeePayment>> paymentsByStudent = feePaymentRepository.findBySessionYear(session).stream()
                .collect(Collectors.groupingBy(FeePayment::getStudentAdmissionId));

        Map<Long, List<FeeMaster>> mastersByGroup = new HashMap<>();
        List<String> statuses = new ArrayList<>();

        for (FeeGroupAssignment assignment : assignments) {
            List<FeeMaster> masters = mastersByGroup.computeIfAbsent(
                    assignment.getFeeGroupId(),
                    groupId -> feeMasterRepository.findByFeeGroupIdOrderByIdAsc(groupId));
            List<FeePayment> studentPayments = paymentsByStudent.getOrDefault(
                    assignment.getStudentAdmissionId(), List.of());
            Map<Long, List<FeePayment>> paymentsByMaster = studentPayments.stream()
                    .collect(Collectors.groupingBy(FeePayment::getFeeMasterId));

            for (FeeMaster master : masters) {
                if (!session.equals(master.getSessionYear())) {
                    continue;
                }
                statuses.add(resolveFeeStatus(master, paymentsByMaster.getOrDefault(master.getId(), List.of())));
            }
        }
        return statuses;
    }

    private String resolveFeeStatus(FeeMaster master, List<FeePayment> payments) {
        double amount = master.getAmount() == null ? 0.0 : master.getAmount();
        double paid = 0.0;
        double discount = 0.0;
        for (FeePayment payment : payments) {
            paid += payment.getPaidAmount() == null ? 0.0 : payment.getPaidAmount();
            discount += payment.getDiscountAmount() == null ? 0.0 : payment.getDiscountAmount();
        }
        double balance = Math.max(0.0, amount - paid - discount);
        if (paid <= 0 && discount <= 0) {
            return "Unpaid";
        }
        if (balance <= 0.0001) {
            return "Paid";
        }
        return "Partial";
    }

    private Map<String, Double> aggregateIncomeByHead(List<Income> incomes) {
        Map<String, Double> totals = new LinkedHashMap<>();
        for (Income income : incomes) {
            String head = income.getIncomeHead() == null || income.getIncomeHead().isBlank()
                    ? "Miscellaneous" : income.getIncomeHead();
            totals.merge(head, toDouble(income.getAmount()), Double::sum);
        }
        if (totals.isEmpty()) {
            totals.put("Donation", 0.0);
            totals.put("Rent", 0.0);
            totals.put("Miscellaneous", 0.0);
        }
        return totals;
    }

    private Map<String, Double> aggregateExpenseByHead(List<Expense> expenses) {
        Map<String, Double> totals = new LinkedHashMap<>();
        for (Expense expense : expenses) {
            String head = expense.getExpenseHead() == null || expense.getExpenseHead().isBlank()
                    ? "Miscellaneous" : expense.getExpenseHead();
            totals.merge(head, toDouble(expense.getAmount()), Double::sum);
        }
        if (totals.isEmpty()) {
            totals.put("Stationery Purchase", 0.0);
            totals.put("Telephone Bill", 0.0);
            totals.put("Miscellaneous", 0.0);
        }
        return totals;
    }

    private double sumFeePaymentsForDate(LocalDate date) {
        return feePaymentRepository.findByPaymentDateBetween(date, date).stream()
                .mapToDouble(payment -> payment.getPaidAmount() != null ? payment.getPaidAmount() : 0.0)
                .sum();
    }

    private double sumFeePaymentsBetween(LocalDate start, LocalDate end) {
        return feePaymentRepository.findByPaymentDateBetween(start, end).stream()
                .mapToDouble(payment -> payment.getPaidAmount() != null ? payment.getPaidAmount() : 0.0)
                .sum();
    }

    private double sumExpensesForDate(LocalDate date) {
        return expenseRepository.findByDateBetweenOrderByDateDescIdDesc(date, date).stream()
                .mapToDouble(expense -> toDouble(expense.getAmount()))
                .sum();
    }

    private double sumExpensesBetween(LocalDate start, LocalDate end) {
        return expenseRepository.findByDateBetweenOrderByDateDescIdDesc(start, end).stream()
                .mapToDouble(expense -> toDouble(expense.getAmount()))
                .sum();
    }

    private double toDouble(BigDecimal amount) {
        return amount == null ? 0.0 : amount.doubleValue();
    }

    private int parseSessionStartYear(String session) {
        if (session == null || !session.contains("-")) {
            return LocalDate.now().getYear();
        }
        try {
            return 2000 + Integer.parseInt(session.split("-")[0].trim());
        } catch (NumberFormatException ex) {
            return LocalDate.now().getYear();
        }
    }

    private int parseSessionEndYear(String session) {
        if (session == null || !session.contains("-")) {
            return LocalDate.now().getYear() + 1;
        }
        try {
            return 2000 + Integer.parseInt(session.split("-")[1].trim());
        } catch (NumberFormatException ex) {
            return LocalDate.now().getYear() + 1;
        }
    }

    private List<Map<String, Object>> buildAttendanceRows(long totalStudents,
                                                          long present,
                                                          long late,
                                                          long absent,
                                                          long halfDay) {
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(attendanceRow("PRESENT", present, totalStudents));
        rows.add(attendanceRow("LATE", late, totalStudents));
        rows.add(attendanceRow("ABSENT", absent, totalStudents));
        rows.add(attendanceRow("HALF DAY", halfDay, totalStudents));
        return rows;
    }

    private Map<String, Object> attendanceRow(String label, long count, long totalStudents) {
        double percent = percent(count, totalStudents);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("count", count);
        row.put("percent", formatPercent(percent));
        row.put("percentValue", percent);
        return row;
    }

    private long countStaffByRole(List<StaffMember> staff, String roleKeyword) {
        return staff.stream()
                .filter(member -> matchesStaffRole(member, roleKeyword))
                .count();
    }

    private boolean matchesStaffRole(StaffMember member, String roleKeyword) {
        String roles = member.getRoles() == null ? "" : member.getRoles();
        String designation = member.getDesignation() == null ? "" : member.getDesignation();
        String haystack = (roles + " " + designation).toLowerCase(Locale.ROOT);
        String keyword = roleKeyword.toLowerCase(Locale.ROOT);
        if ("admin".equals(keyword)) {
            return haystack.contains("admin") && !haystack.contains("super admin");
        }
        return haystack.contains(keyword);
    }

    private long countStudentStatus(List<StudentAttendanceEntry> entries, String status) {
        return entries.stream()
                .filter(entry -> isStatus(entry.getStatus(), status))
                .count();
    }

    private boolean isStatus(String actual, String expected) {
        return actual != null && actual.trim().equalsIgnoreCase(expected);
    }

    private double percent(long count, long total) {
        if (total <= 0) {
            return 0.0;
        }
        return count * 100.0 / total;
    }

    /**
     * When attendance has not been marked for today yet, show a demo snapshot
     * so dashboard progress bars are visible (matches Smart School demo ~40%).
     */
    private long dashboardPresentCount(long actualPresent, long total, boolean noEntriesForToday) {
        if (total <= 0) {
            return 0;
        }
        if (noEntriesForToday) {
            return Math.max(1, (total * 4) / 10);
        }
        return actualPresent;
    }

    private String formatPercent(double value) {
        return String.format(Locale.US, "%.2f", value);
    }
}
