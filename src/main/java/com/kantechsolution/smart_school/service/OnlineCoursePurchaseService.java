package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.OnlineCoursePurchase;
import com.kantechsolution.smart_school.repository.OnlineCoursePurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OnlineCoursePurchaseService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    @Autowired
    private OnlineCoursePurchaseRepository purchaseRepository;

    @Transactional
    public Map<String, Object> search(String searchType, String paymentType, String paymentStatus, String usersType) {
        ensureSeed();
        LocalDate[] range = resolveRange(searchType);
        List<OnlineCoursePurchase> purchases = purchaseRepository.search(
                paymentType, paymentStatus, usersType, range[0], range[1]);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (OnlineCoursePurchase purchase : purchases) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", purchase.getId());
            row.put("studentOrGuest", purchase.getStudentOrGuest());
            row.put("date", purchase.getPurchaseDate() == null ? "" : DATE_FMT.format(purchase.getPurchaseDate()));
            row.put("course", purchase.getCourseName());
            row.put("courseProvider", purchase.getCourseProvider());
            row.put("paymentType", purchase.getPaymentType());
            row.put("paymentMethod", purchase.getPaymentMethod());
            row.put("price", purchase.getPrice());
            rows.add(row);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("rows", rows);
        body.put("total", rows.size());
        return body;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        OnlineCoursePurchase purchase = new OnlineCoursePurchase();
        purchase.setStudentOrGuest(required(body.get("studentOrGuest"), "Student / Guest is required"));
        purchase.setCourseName(required(body.get("courseName"), "Course is required"));
        purchase.setCourseProvider(text(body.get("courseProvider")));
        purchase.setPaymentType(blankTo(text(body.get("paymentType")), "offline"));
        purchase.setPaymentMethod(blankTo(text(body.get("paymentMethod")), "Cash"));
        purchase.setPaymentStatus(blankTo(text(body.get("paymentStatus")), "success"));
        purchase.setUsersType(blankTo(text(body.get("usersType")), "student"));
        purchase.setPrice(asDouble(body.get("price")));
        String dateText = text(body.get("purchaseDate"));
        purchase.setPurchaseDate(dateText.isBlank() ? LocalDate.now() : LocalDate.parse(dateText, DATE_FMT));
        purchaseRepository.save(purchase);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", purchase.getId());
        row.put("studentOrGuest", purchase.getStudentOrGuest());
        row.put("date", DATE_FMT.format(purchase.getPurchaseDate()));
        row.put("course", purchase.getCourseName());
        row.put("courseProvider", purchase.getCourseProvider());
        row.put("paymentType", purchase.getPaymentType());
        row.put("paymentMethod", purchase.getPaymentMethod());
        row.put("price", purchase.getPrice());
        return row;
    }

    private void ensureSeed() {
        if (purchaseRepository.count() > 0) return;
        OnlineCoursePurchase one = new OnlineCoursePurchase();
        one.setStudentOrGuest("Guest User 101");
        one.setPurchaseDate(LocalDate.now());
        one.setCourseName("Basic Computer Course for Beginners");
        one.setCourseProvider("Shivam Verma");
        one.setPaymentType("offline");
        one.setPaymentMethod("Cash");
        one.setPaymentStatus("success");
        one.setUsersType("guest");
        one.setPrice(200.0);
        purchaseRepository.save(one);
    }

    private LocalDate[] resolveRange(String searchType) {
        LocalDate today = LocalDate.now();
        String type = searchType == null ? "this_week" : searchType.trim().toLowerCase();
        return switch (type) {
            case "today" -> new LocalDate[]{today, today};
            case "this_month" -> new LocalDate[]{today.withDayOfMonth(1), today};
            case "last_month" -> {
                LocalDate first = today.minusMonths(1).withDayOfMonth(1);
                yield new LocalDate[]{first, first.with(TemporalAdjusters.lastDayOfMonth())};
            }
            case "this_year" -> new LocalDate[]{today.withDayOfYear(1), today};
            case "period" -> new LocalDate[]{null, null};
            default -> {
                LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                yield new LocalDate[]{start, today};
            }
        };
    }

    private String required(Object value, String message) {
        String text = text(value);
        if (text.isBlank()) throw new IllegalArgumentException(message);
        return text;
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Double asDouble(Object value) {
        if (value == null || String.valueOf(value).trim().isEmpty()) return 0.0;
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid price value");
        }
    }
}
