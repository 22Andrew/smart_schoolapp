package com.kantechsolution.smart_school.report;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class ReportModuleCatalog {

    private static final Map<String, ReportCategoryDefinition> CATEGORIES = buildCategories();

    private ReportModuleCatalog() {
    }

    public static Map<String, ReportCategoryDefinition> allCategories() {
        return CATEGORIES;
    }

    public static Optional<ReportCategoryDefinition> findCategory(String slug) {
        if (slug == null || slug.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(CATEGORIES.get(slug.toLowerCase()));
    }

    private static ReportCategoryDefinition category(String slug, String title, String sidebarLabel,
                                                     List<ReportDefinition> reports) {
        return new ReportCategoryDefinition(slug, title, sidebarLabel, reports);
    }

    private static ReportDefinition report(String key, String title, String listTitle,
                                           boolean showClassSection, boolean showDateRange, boolean needsSearch) {
        return report(key, title, listTitle, showClassSection, showDateRange, needsSearch,
                false, false, false, false, false, false, false, false, false);
    }

    private static ReportDefinition report(String key, String title, String listTitle,
                                           boolean showClassSection, boolean showDateRange, boolean needsSearch,
                                           boolean showStaffAttendanceCriteria) {
        return report(key, title, listTitle, showClassSection, showDateRange, needsSearch,
                showStaffAttendanceCriteria, false, false, false, false, false, false, false, false);
    }

    private static ReportDefinition report(String key, String title, String listTitle,
                                           boolean showClassSection, boolean showDateRange, boolean needsSearch,
                                           boolean showStaffAttendanceCriteria, boolean showStaffDayWiseCriteria) {
        return report(key, title, listTitle, showClassSection, showDateRange, needsSearch,
                showStaffAttendanceCriteria, showStaffDayWiseCriteria, false, false, false, false, false, false, false);
    }

    private static ReportDefinition report(String key, String title, String listTitle,
                                           boolean showClassSection, boolean showDateRange, boolean needsSearch,
                                           boolean showStaffAttendanceCriteria, boolean showStaffDayWiseCriteria,
                                           boolean showOnlineExamCriteria) {
        return report(key, title, listTitle, showClassSection, showDateRange, needsSearch,
                showStaffAttendanceCriteria, showStaffDayWiseCriteria, showOnlineExamCriteria, false,
                false, false, false, false, false);
    }

    private static ReportDefinition report(String key, String title, String listTitle,
                                           boolean showClassSection, boolean showDateRange, boolean needsSearch,
                                           boolean showStaffAttendanceCriteria, boolean showStaffDayWiseCriteria,
                                           boolean showOnlineExamCriteria, boolean showOnlineExamDateCriteria) {
        return report(key, title, listTitle, showClassSection, showDateRange, needsSearch,
                showStaffAttendanceCriteria, showStaffDayWiseCriteria, showOnlineExamCriteria, showOnlineExamDateCriteria,
                false, false, false, false, false);
    }

    private static ReportDefinition report(String key, String title, String listTitle,
                                           boolean showClassSection, boolean showDateRange, boolean needsSearch,
                                           boolean showStaffAttendanceCriteria, boolean showStaffDayWiseCriteria,
                                           boolean showOnlineExamCriteria, boolean showOnlineExamDateCriteria,
                                           boolean showFinanceSearchTypeCriteria, boolean showFinanceCollectionCriteria,
                                           boolean showFinanceFeesStatementCriteria, boolean showFinanceIncomeHeadCriteria,
                                           boolean showFinanceExpenseHeadCriteria) {
        return new ReportDefinition(key, title, listTitle, showClassSection, showDateRange, needsSearch,
                showStaffAttendanceCriteria, showStaffDayWiseCriteria, showOnlineExamCriteria, showOnlineExamDateCriteria,
                showFinanceSearchTypeCriteria, showFinanceCollectionCriteria, showFinanceFeesStatementCriteria,
                showFinanceIncomeHeadCriteria, showFinanceExpenseHeadCriteria);
    }

    private static ReportDefinition financeCriteriaReport(String key, String title, String listTitle,
                                                          boolean searchType, boolean collection, boolean feesStatement,
                                                          boolean incomeHead, boolean expenseHead) {
        return report(key, title, listTitle, false, false, true,
                false, false, false, false,
                searchType, collection, feesStatement, incomeHead, expenseHead);
    }

    private static Map<String, ReportCategoryDefinition> buildCategories() {
        Map<String, ReportCategoryDefinition> map = new LinkedHashMap<>();

        map.put("studentinformation", category(
                "studentinformation",
                "Student Information Reports",
                "Student Information",
                List.of(
                        report("studentreport", "Student Report", "Student List", true, false, true),
                        report("studentprofile", "Student Profile", "Student Profile List", true, false, true),
                        report("admissionreport", "Admission Report", "Admission List", true, true, true),
                        report("studentlogincredential", "Student Login Credential", "Student Login Credential List", true, false, true),
                        report("studenthistory", "Student History", "Student History List", true, false, true),
                        report("guardianreport", "Guardian Report", "Guardian List", true, false, true),
                        report("classsubjectreport", "Class Subject Report", "Class Subject List", true, false, true),
                        report("siblingreport", "Sibling Report", "Sibling List", true, false, true),
                        report("studentgenderatio", "Student Gender Ratio Report", "Gender Ratio List", false, false, false),
                        report("studentteacherratio", "Student Teacher Ratio Report", "Student Teacher Ratio List", false, false, false)
                )
        ));

        map.put("finance", category(
                "finance",
                "Finance",
                "Finance",
                List.of(
                        report("balancefeesstatement", "Balance Fees Statement", "Balance Fees Statement List", true, false, true),
                        report("dailycollectionreport", "Daily Collection Report", "Daily Collection List", false, true, true),
                        financeCriteriaReport("feesstatement", "Fees Statement", "Fees Statement", false, false, true, false, false),
                        report("studentacademicreport", "Balance Fees Report", "Balance Fees List", true, false, true),
                        financeCriteriaReport("feescollectionreport", "Fees Collection Report", "Fees Collection Report", false, true, false, false, false),
                        financeCriteriaReport("onlinefeescollectionreport", "Online Fees Collection Report", "Online Fees Collection Report", true, false, false, false, false),
                        report("balancefeesreportwithremark", "Balance Fees Report With Remark", "Balance Fees Report With Remark List", true, false, true),
                        financeCriteriaReport("incomereport", "Income Report", "Income Report", true, false, false, false, false),
                        financeCriteriaReport("expensereport", "Expense Report", "Expense Report", true, false, false, false, false),
                        financeCriteriaReport("payrollreport", "Payroll Report", "Payroll Report", true, false, false, false, false),
                        financeCriteriaReport("incomegroupreport", "Income Group Report", "Income Group Report", true, false, false, true, false),
                        financeCriteriaReport("expensegroupreport", "Expense Group Report", "Expense Group Report", true, false, false, false, true),
                        financeCriteriaReport("onlineadmissionfeescollectionreport", "Online Admission Fees Collection Report", "Online Admission Fees Collection Report", true, false, false, false, false),
                        report("duereport", "Due Fees Report", "Due Fees List", true, false, true),
                        financeCriteriaReport("incomeexpensebalancereport", "Income Expense Balance Report", "Income Expense Balance Report", true, false, false, false, false),
                        report("incomeexpensereport", "Income Expense Report", "Income Expense List", false, true, true),
                        report("feegroupreport", "Fee Group Report", "Fee Group List", false, false, false)
                )
        ));

        map.put("attendance", category(
                "attendance",
                "Attendance Reports",
                "Attendance",
                List.of(
                        report("attendancereport", "Attendance Report", "Attendance List", true, true, true),
                        report("studentattendancetypereport", "Student Attendance Type Report", "Student Attendance Type List", true, true, true),
                        report("dailyattendancereport", "Daily Attendance Report", "Daily Attendance List", false, true, true),
                        report("studentdaywiseattendancereport", "Student Day Wise Attendance Report", "Day Wise Attendance List", true, true, true),
                        report("staffdaywiseattendancereport", "Staff Day Wise Attendance Report", "Staff Day Wise List", false, false, true, false, true),
                        report("staffattendancereport", "Staff Attendance Report", "Staff Attendance List", false, false, true, true, false),
                        report("biometricattendancelog", "Biometric Attendance Log", "Biometric Attendance Log List", true, true, true),
                        report("studentattendancereport", "Student Attendance Report", "Student Attendance List", true, true, true),
                        report("studentmonthlyattendancereport", "Student Monthly Attendance Report", "Monthly Attendance List", true, false, true),
                        report("staffmonthlyattendancereport", "Staff Monthly Attendance Report", "Staff Monthly List", false, false, true)
                )
        ));

        map.put("examinations", category(
                "examinations",
                "Examination Reports",
                "Examinations",
                List.of(
                        report("rankreport", "Rank Report", "Rank List", true, false, true),
                        report("examrankreport", "Exam Rank Report", "Exam Rank List", true, false, true),
                        report("examresultsreport", "Exam Results Report", "Exam Results List", true, false, true),
                        report("examsubjectreport", "Exam Subject Report", "Exam Subject List", true, false, true),
                        report("admitcardreport", "Admit Card Report", "Admit Card List", true, false, true),
                        report("marksheetreport", "Marksheet Report", "Marksheet List", true, false, true)
                )
        ));

        map.put("onlineexaminations", category(
                "onlineexaminations",
                "Online Examinations Report",
                "Online Examinations",
                List.of(
                        report("resultreport", "Result Report", "Result Report", false, false, true, false, false, true, false),
                        report("examsreport", "Exams Report", "Exams Report", false, false, true, false, false, false, true),
                        report("studentexamsattemptreport", "Student Exams Attempt Report", "Student Exams Attempt Report", false, false, true, false, false, false, true),
                        report("examsrankreport", "Exams Rank Report", "Exams Rank Report", false, false, true, false, false, true, false)
                )
        ));

        map.put("lessonplan", category(
                "lessonplan",
                "Lesson Plan Reports",
                "Lesson Plan",
                List.of(
                        report("lessonplanreport", "Lesson Plan Report", "Lesson Plan List", true, true, true),
                        report("syllabusstatusreport", "Syllabus Status Report", "Syllabus Status List", true, false, true),
                        report("subjectlessonreport", "Subject Lesson Report", "Subject Lesson List", true, false, true)
                )
        ));

        map.put("humanresource", category(
                "humanresource",
                "Human Resource Reports",
                "Human Resource",
                List.of(
                        report("staffreport", "Staff Report", "Staff List", false, false, false),
                        report("payrollreport", "Payroll Report", "Payroll List", false, true, true),
                        report("leaveapplicationreport", "Leave Application Report", "Leave Application List", false, true, true),
                        report("staffattendancesummary", "Staff Attendance Summary", "Staff Attendance Summary List", false, true, true)
                )
        ));

        map.put("homework", category(
                "homework",
                "Homework Reports",
                "Homework",
                List.of(
                        report("homeworkreport", "Homework Report", "Homework List", true, true, true),
                        report("homeworkevaluationreport", "Homework Evaluation Report", "Homework Evaluation List", true, false, true)
                )
        ));

        map.put("library", category(
                "library",
                "Library Reports",
                "Library",
                List.of(
                        report("bookduereport", "Book Due Report", "Book Due List", false, false, false),
                        report("bookinventoryreport", "Book Inventory Report", "Book Inventory List", false, false, false),
                        report("bookissuereport", "Book Issue Report", "Book Issue List", false, true, true)
                )
        ));

        map.put("inventory", category(
                "inventory",
                "Inventory Reports",
                "Inventory",
                List.of(
                        report("stockreport", "Stock Report", "Stock List", false, false, false),
                        report("itemreport", "Item Report", "Item List", false, false, false),
                        report("issuereport", "Issue Report", "Issue List", false, true, true)
                )
        ));

        map.put("transport", category(
                "transport",
                "Transport Reports",
                "Transport",
                List.of(
                        report("transportfeesreport", "Transport Fees Report", "Transport Fees List", true, false, true),
                        report("studenttransportreport", "Student Transport Report", "Student Transport List", true, false, true),
                        report("routereport", "Route Report", "Route List", false, false, false)
                )
        ));

        map.put("hostel", category(
                "hostel",
                "Hostel Reports",
                "Hostel",
                List.of(
                        report("hostelroomreport", "Hostel Room Report", "Hostel Room List", false, false, false),
                        report("hostelstudentreport", "Hostel Student Report", "Hostel Student List", false, false, true)
                )
        ));

        map.put("alumni", category(
                "alumni",
                "Alumni Reports",
                "Alumni",
                List.of(
                        report("alumnireport", "Alumni Report", "Alumni List", false, false, false),
                        report("alumnieventreport", "Alumni Event Report", "Alumni Event List", false, true, true)
                )
        ));

        map.put("userlog", category(
                "userlog",
                "User Log Reports",
                "User Log",
                List.of(
                        report("userlogreport", "User Log Report", "User Log List", false, true, true)
                )
        ));

        map.put("audittrail", category(
                "audittrail",
                "Audit Trail Reports",
                "Audit Trail Report",
                List.of(
                        report("audittrailreport", "Audit Trail Report", "Audit Trail List", false, true, true)
                )
        ));

        return Map.copyOf(map);
    }
}
