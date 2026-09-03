package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AnnualHoliday;
import com.kantechsolution.smart_school.repository.AnnualHolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(2)
public class HolidayService implements ApplicationRunner {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final AnnualHolidayRepository annualHolidayRepository;
    private final HolidayTypeService holidayTypeService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (annualHolidayRepository.count() == 0) {
            seedSampleHolidays();
        }
    }

    @Transactional(readOnly = true)
    public List<String> getHolidayTypes() {
        return holidayTypeService.getTypeNames();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchHolidays(String type) {
        List<AnnualHoliday> rows;
        if (type == null || type.isBlank()) {
            rows = annualHolidayRepository.findAllByOrderByFromDateDescIdDesc();
        } else {
            rows = annualHolidayRepository.findByHolidayTypeIgnoreCaseOrderByFromDateDescIdDesc(type.trim());
        }
        return rows.stream().map(this::toMap).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getHolidayById(Long id) {
        AnnualHoliday holiday = annualHolidayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found"));
        return toMap(holiday);
    }

    @Transactional
    public Map<String, Object> createHoliday(Map<String, Object> payload) {
        AnnualHoliday holiday = new AnnualHoliday();
        applyPayload(holiday, payload);
        holiday.setCreatedByName("Joe Black");
        holiday.setCreatedByStaffId("9000");
        return toMap(annualHolidayRepository.save(holiday));
    }

    @Transactional
    public Map<String, Object> updateHoliday(Long id, Map<String, Object> payload) {
        AnnualHoliday holiday = annualHolidayRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found"));
        applyPayload(holiday, payload);
        return toMap(annualHolidayRepository.save(holiday));
    }

    @Transactional
    public void deleteHoliday(Long id) {
        if (!annualHolidayRepository.existsById(id)) {
            throw new IllegalArgumentException("Holiday not found");
        }
        annualHolidayRepository.deleteById(id);
    }

    private void applyPayload(AnnualHoliday holiday, Map<String, Object> payload) {
        String type = stringValue(payload.get("holidayType"));
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Type is required");
        }
        List<String> allowedTypes = holidayTypeService.getTypeNames();
        if (!allowedTypes.stream().anyMatch(t -> t.equalsIgnoreCase(type.trim()))) {
            throw new IllegalArgumentException("Invalid holiday type");
        }
        holiday.setHolidayType(normalizeType(type, allowedTypes));

        LocalDate fromDate = parseDate(payload.get("fromDate"));
        LocalDate toDate = parseDate(payload.get("toDate"));
        if (fromDate == null || toDate == null) {
            throw new IllegalArgumentException("From Date and To Date are required");
        }
        if (toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("To Date cannot be before From Date");
        }
        holiday.setFromDate(fromDate);
        holiday.setToDate(toDate);

        String description = stringValue(payload.get("description"));
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }
        holiday.setDescription(description.trim());

        holiday.setFrontSite(parseBoolean(payload.get("frontSite")));
    }

    private String normalizeType(String type, List<String> allowedTypes) {
        for (String allowed : allowedTypes) {
            if (allowed.equalsIgnoreCase(type.trim())) {
                return allowed;
            }
        }
        return type.trim();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private boolean parseBoolean(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return "true".equalsIgnoreCase(String.valueOf(value))
                || "yes".equalsIgnoreCase(String.valueOf(value))
                || "1".equals(String.valueOf(value));
    }

    private LocalDate parseDate(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return null;
        }
        if (text.contains("/")) {
            return LocalDate.parse(text, US_DATE);
        }
        return LocalDate.parse(text);
    }

    private Map<String, Object> toMap(AnnualHoliday holiday) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", holiday.getId());
        row.put("holidayType", holiday.getHolidayType());
        row.put("fromDate", holiday.getFromDate().format(US_DATE));
        row.put("toDate", holiday.getToDate().format(US_DATE));
        row.put("description", holiday.getDescription());
        row.put("frontSite", Boolean.TRUE.equals(holiday.getFrontSite()));
        row.put("createdByName", holiday.getCreatedByName());
        row.put("createdByStaffId", holiday.getCreatedByStaffId());
        row.put("createdBy", formatCreatedBy(holiday));
        row.put("dateRange", formatDateRange(holiday));
        return row;
    }

    private String formatCreatedBy(AnnualHoliday holiday) {
        String name = holiday.getCreatedByName() == null ? "" : holiday.getCreatedByName();
        String staffId = holiday.getCreatedByStaffId() == null ? "" : holiday.getCreatedByStaffId();
        if (!staffId.isBlank()) {
            return name + " (" + staffId + ")";
        }
        return name;
    }

    private String formatDateRange(AnnualHoliday holiday) {
        String from = holiday.getFromDate().format(US_DATE);
        String to = holiday.getToDate().format(US_DATE);
        return from + " To " + to;
    }

    private void seedSampleHolidays() {
        List<AnnualHoliday> samples = List.of(
                AnnualHoliday.builder()
                        .holidayType("School Events")
                        .fromDate(LocalDate.of(2026, 8, 31))
                        .toDate(LocalDate.of(2026, 8, 31))
                        .description("Parent-Teacher Meeting (PTM)")
                        .frontSite(true)
                        .createdByName("Joe Black")
                        .createdByStaffId("9000")
                        .build(),
                AnnualHoliday.builder()
                        .holidayType("Holiday")
                        .fromDate(LocalDate.of(2026, 6, 16))
                        .toDate(LocalDate.of(2026, 6, 17))
                        .description("Ambedkar Jayanti — National Holiday")
                        .frontSite(true)
                        .createdByName("Joe Black")
                        .createdByStaffId("9000")
                        .build(),
                AnnualHoliday.builder()
                        .holidayType("Vacation")
                        .fromDate(LocalDate.of(2026, 12, 24))
                        .toDate(LocalDate.of(2027, 1, 2))
                        .description("Winter Break")
                        .frontSite(true)
                        .createdByName("Joe Black")
                        .createdByStaffId("9000")
                        .build(),
                AnnualHoliday.builder()
                        .holidayType("Activity")
                        .fromDate(LocalDate.of(2026, 3, 15))
                        .toDate(LocalDate.of(2026, 3, 15))
                        .description("Science Exhibition")
                        .frontSite(false)
                        .createdByName("Joe Black")
                        .createdByStaffId("9000")
                        .build(),
                AnnualHoliday.builder()
                        .holidayType("EVENTS")
                        .fromDate(LocalDate.of(2026, 1, 26))
                        .toDate(LocalDate.of(2026, 1, 26))
                        .description("Republic Day Celebration")
                        .frontSite(true)
                        .createdByName("Joe Black")
                        .createdByStaffId("9000")
                        .build()
        );
        annualHolidayRepository.saveAll(samples);
    }
}
