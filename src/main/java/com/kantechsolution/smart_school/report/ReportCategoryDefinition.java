package com.kantechsolution.smart_school.report;

import java.util.List;

public record ReportCategoryDefinition(
        String slug,
        String title,
        String sidebarLabel,
        List<ReportDefinition> reports
) {
    public ReportDefinition defaultReport() {
        return reports.isEmpty() ? null : reports.get(0);
    }

    public ReportDefinition findReport(String reportKey) {
        if (reportKey == null) {
            return null;
        }
        return reports.stream()
                .filter(report -> report.key().equalsIgnoreCase(reportKey))
                .findFirst()
                .orElse(null);
    }
}
