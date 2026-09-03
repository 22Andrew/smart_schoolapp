package com.kantechsolution.smart_school.service;

import java.util.ArrayList;
import java.util.List;

public class CommunicateDeliveryResult {

    private int sentCount;
    private int failedCount;
    private final List<String> errors = new ArrayList<>();

    public void recordSuccess() {
        sentCount++;
    }

    public void recordFailure(String error) {
        failedCount++;
        if (error != null && !error.isBlank()) {
            errors.add(error);
        }
    }

    public int getSentCount() {
        return sentCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public List<String> getErrors() {
        return List.copyOf(errors);
    }

    public boolean hasSent() {
        return sentCount > 0;
    }

    public String summary() {
        if (sentCount == 0 && failedCount == 0) {
            return "No recipients were found for this message.";
        }
        StringBuilder builder = new StringBuilder();
        builder.append("Delivered to ").append(sentCount).append(" recipient(s)");
        if (failedCount > 0) {
            builder.append(", failed for ").append(failedCount);
        }
        if (!errors.isEmpty()) {
            builder.append(". ").append(errors.get(0));
        }
        return builder.toString();
    }

    public void requireSuccess() {
        if (!hasSent()) {
            throw new IllegalArgumentException(summary());
        }
    }

    public void mergeFrom(CommunicateDeliveryResult other) {
        if (other == null) {
            return;
        }
        for (int i = 0; i < other.sentCount; i++) {
            recordSuccess();
        }
        for (String error : other.errors) {
            recordFailure(error);
        }
    }
}
