package com.kantechsolution.smart_school.report;

public record ReportDefinition(
        String key,
        String title,
        String listTitle,
        boolean showClassSection,
        boolean showDateRange,
        boolean needsSearch,
        boolean showStaffAttendanceCriteria,
        boolean showStaffDayWiseCriteria,
        boolean showOnlineExamCriteria,
        boolean showOnlineExamDateCriteria,
        boolean showFinanceSearchTypeCriteria,
        boolean showFinanceCollectionCriteria,
        boolean showFinanceFeesStatementCriteria,
        boolean showFinanceIncomeHeadCriteria,
        boolean showFinanceExpenseHeadCriteria
) {
}
