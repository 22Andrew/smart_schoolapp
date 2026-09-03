package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.FeeReminder;
import com.kantechsolution.smart_school.model.FeeReminder.ReminderType;
import com.kantechsolution.smart_school.repository.FeeReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class FeeReminderService {

    @Autowired
    private FeeReminderRepository feeReminderRepository;

    @Transactional
    public List<FeeReminder> getSettings() {
        List<FeeReminder> existing = feeReminderRepository.findAllByOrderBySortOrderAscIdAsc();
        if (!existing.isEmpty()) {
            return existing;
        }
        return seedDefaults();
    }

    @Transactional
    public List<FeeReminder> saveSettings(List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Reminder settings are required");
        }

        List<FeeReminder> current = feeReminderRepository.findAllByOrderBySortOrderAscIdAsc();
        if (current.isEmpty()) {
            current = seedDefaults();
        }

        if (items.size() != current.size()) {
            // Allow saving exactly the rows shown; resize by replacing all
            feeReminderRepository.deleteAll();
            current = new ArrayList<>();
            for (int i = 0; i < items.size(); i++) {
                current.add(new FeeReminder(true, ReminderType.BEFORE, 1, i + 1));
            }
            current = feeReminderRepository.saveAll(current);
        }

        for (int i = 0; i < items.size(); i++) {
            Map<String, Object> item = items.get(i);
            FeeReminder row = current.get(i);
            row.setActive(asBoolean(item.get("active")));
            row.setReminderType(parseType(asString(item.get("reminderType"))));
            Integer days = asInteger(item.get("days"));
            if (days == null || days < 0) {
                throw new IllegalArgumentException("Days must be zero or greater");
            }
            row.setDays(days);
            row.setSortOrder(i + 1);
        }
        return feeReminderRepository.saveAll(current);
    }

    private List<FeeReminder> seedDefaults() {
        List<FeeReminder> defaults = new ArrayList<>();
        defaults.add(new FeeReminder(true, ReminderType.BEFORE, 2, 1));
        defaults.add(new FeeReminder(true, ReminderType.BEFORE, 5, 2));
        defaults.add(new FeeReminder(true, ReminderType.AFTER, 2, 3));
        defaults.add(new FeeReminder(true, ReminderType.AFTER, 5, 4));
        return feeReminderRepository.saveAll(defaults);
    }

    private ReminderType parseType(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if ("AFTER".equals(normalized)) {
            return ReminderType.AFTER;
        }
        if ("BEFORE".equals(normalized) || normalized.isEmpty()) {
            return ReminderType.BEFORE;
        }
        throw new IllegalArgumentException("Invalid reminder type");
    }

    private boolean asBoolean(Object value) {
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        if (value == null) {
            return false;
        }
        String text = String.valueOf(value).trim().toLowerCase(Locale.ROOT);
        return "true".equals(text) || "1".equals(text) || "yes".equals(text) || "on".equals(text);
    }

    private Integer asInteger(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) {
            return null;
        }
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid days value");
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
