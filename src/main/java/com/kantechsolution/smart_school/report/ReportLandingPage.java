package com.kantechsolution.smart_school.report;

import java.util.List;

public record ReportLandingPage(
        String categorySlug,
        String pageTitle,
        String landingPath,
        String reportBasePath,
        List<ReportLandingItem> items
) {
}
