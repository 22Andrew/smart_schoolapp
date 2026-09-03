package com.kantechsolution.smart_school.report;

public record ReportLandingItem(String key, String title, String urlPath) {
    public ReportLandingItem(String key, String title) {
        this(key, title, null);
    }
}
