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
                        report("lessonplanreport", "Lesson Plan Report", "Lesson Plan Report", true, true, true),
                        report("syllabusstatusreport", "Syllabus Status Report", "Syllabus Status Report", false, false, true),
                        report("subjectlessonreport", "Subject Lesson Plan Report", "Subject Lesson Plan Report", false, false, true)
                )
        ));

        map.put("humanresource", category(
                "humanresource",
                "Human Resource Report",
                "Human Resource",
                List.of(
                        report("staffreport", "Staff Report", "Staff Report", false, false, true),
                        report("payrollreport", "Payroll Report", "Payroll Report", false, false, true),
                        report("leaverequestreport", "Leave Request Report", "Leave Request Report", false, false, true),
                        report("myleaverequestreport", "My Leave Request Report", "My Leave Request Report", false, false, true)
                )
        ));

        map.put("homework", category(
                "homework",
                "Homework Report",
                "Homework",
                List.of(
                        report("homeworkreport", "Homework Report", "Homework Report", true, false, true),
                        report("evaluation_report", "Homework Evaluation Report", "Homework Evaluation Report", true, false, true),
                        report("homeworkordailyassignmentreport", "Daily Assignment Report", "Daily Assignment Report", true, false, true),
                        report("homeworksmarksreport", "Homework Marks Report", "Homework Marks Report", true, false, true)
                )
        ));

        map.put("library", category(
                "library",
                "Library Report",
                "Library",
                List.of(
                        report("studentbookissuereport", "Book Issue Report", "Book Issue Report", false, false, true),
                        report("bookduereport", "Book Due Report", "Book Due Report", false, false, true),
                        report("bookinventory", "Book Inventory Report", "Book Inventory Report", false, false, true),
                        report("issuereturnreport", "Book Issue Return Report", "Book Issue Return Report", false, false, true)
                )
        ));

        map.put("inventory", category(
                "inventory",
                "Inventory Report",
                "Inventory",
                List.of(
                        report("inventorystock", "Stock Report", "Stock Report", false, false, true),
                        report("additem", "Add Item Report", "Add Item Report", false, false, true),
                        report("issueinventory", "Issue Item Report", "Issue Item Report", false, false, true)
                )
        ));

        map.put("transport", category(
                "transport",
                "Transport Reports",
                "Transport",
                List.of(
                        report("studenttransportdetails", "Student Transport Report", "Student Transport Report", true, false, true),
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
                        report("studenthosteldetails", "Student Hostel Report", "Student Hostel Report", true, false, true),
                        report("hostelroomreport", "Hostel Room Report", "Hostel Room List", false, false, false),
                        report("hostelstudentreport", "Hostel Student Report", "Hostel Student List", false, false, true)
                )
        ));

        map.put("alumni", category(
                "alumni",
                "Alumni Reports",
                "Alumni",
                List.of(
                        report("alumnireport", "Alumni Report", "Alumni Report", true, false, true),
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
