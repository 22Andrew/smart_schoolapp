package com.kantechsolution.smart_school.report;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class ReportLandingCatalog {

    private static final Map<String, ReportLandingPage> PAGES = buildPages();

    private ReportLandingCatalog() {
    }

    public static Optional<ReportLandingPage> findByCategorySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(PAGES.get(slug.toLowerCase()));
    }

    public static Optional<ReportLandingPage> findByLandingPath(String path) {
        if (path == null || path.isBlank()) {
            return Optional.empty();
        }
        String normalized = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
        return PAGES.values().stream()
                .filter(page -> page.landingPath().equalsIgnoreCase(normalized))
                .findFirst();
    }

    public static Optional<ReportLandingPage> findByReportBasePath(String basePath) {
        if (basePath == null || basePath.isBlank()) {
            return Optional.empty();
        }
        String normalized = basePath.endsWith("/") ? basePath.substring(0, basePath.length() - 1) : basePath;
        return PAGES.values().stream()
                .filter(page -> normalized.startsWith(page.reportBasePath() + "/")
                        || normalized.equalsIgnoreCase(page.reportBasePath()))
                .findFirst();
    }

    private static ReportLandingPage page(String categorySlug,
                                          String pageTitle,
                                          String landingPath,
                                          List<ReportLandingItem> items) {
        return new ReportLandingPage(categorySlug, pageTitle, landingPath, landingPath, items);
    }

    private static ReportLandingItem item(String key, String title) {
        return new ReportLandingItem(key, title);
    }

    private static ReportLandingItem item(String key, String title, String urlPath) {
        return new ReportLandingItem(key, title, urlPath);
    }

    private static Map<String, ReportLandingPage> buildPages() {
        Map<String, ReportLandingPage> map = new LinkedHashMap<>();

        map.put("attendance", page(
                "attendance",
                "Attendance Report",
                "/attendencereports/attendance",
                List.of(
                        item("attendancereport", "Attendance Report"),
                        item("studentattendancetypereport", "Student Attendance Type Report"),
                        item("dailyattendancereport", "Daily Attendance Report"),
                        item("studentdaywiseattendancereport", "Student Day Wise Attendance Report"),
                        item("staffdaywiseattendancereport", "Staff Day Wise Attendance Report"),
                        item("staffattendancereport", "Staff Attendance Report"),
                        item("biometricattendancelog", "Biometric Attendance Log")
                )
        ));

        map.put("examinations", page(
                "examinations",
                "Examinations Report",
                "/admin/examresult/examinations",
                List.of(
                        item("rankreport", "Rank Report")
                )
        ));

        map.put("finance", page(
                "finance",
                "Finance",
                "/admin/financereports/finance",
                List.of(
                        item("balancefeesstatement", "Balance Fees Statement"),
                        item("dailycollectionreport", "Daily Collection Report"),
                        item("feesstatement", "Fees Statement", "/financereports/reportbyname"),
                        item("studentacademicreport", "Balance Fees Report", "/financereports/studentacademicreport"),
                        item("feescollectionreport", "Fees Collection Report", "/financereports/collection_report"),
                        item("onlinefeescollectionreport", "Online Fees Collection Report", "/financereports/onlinefeesreporte"),
                        item("balancefeesreportwithremark", "Balance Fees Report With Remark"),
                        item("incomereport", "Income Report", "/financereports/income"),
                        item("expensereport", "Expense Report", "/financereports/expense"),
                        item("payrollreport", "Payroll Report", "/financereports/payroll"),
                        item("incomegroupreport", "Income Group Report", "/financereports/incomegroup"),
                        item("expensegroupreport", "Expense Group Report", "/financereports/expensegroup"),
                        item("onlineadmissionfeescollectionreport", "Online Admission Fees Collection Report", "/financereports/onlineadmission"),
                        item("duereport", "Due Fees Report"),
                        item("incomeexpensebalancereport", "Income Expense Balance Report", "/financereports/incomeexpensebalancereport")
                )
        ));

        map.put("onlineexaminations", page(
                "onlineexaminations",
                "Online Examinations Report",
                "/admin/onlineexam/report",
                List.of(
                        item("resultreport", "Result Report"),
                        item("examsreport", "Exams Report"),
                        item("studentexamsattemptreport", "Student Exams Attempt Report"),
                        item("examsrankreport", "Exams Rank Report")
                )
        ));

        return Map.copyOf(map);
    }
}
