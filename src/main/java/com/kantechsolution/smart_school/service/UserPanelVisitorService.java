package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Visitor;
import com.kantechsolution.smart_school.repository.VisitorRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserPanelVisitorService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter US_TIME = DateTimeFormatter.ofPattern("hh:mm a", Locale.US);

    private final VisitorRepository visitorRepository;

    public UserPanelVisitorService(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listVisitors(Authentication authentication) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Visitor visitor : visitorRepository.findAllByOrderByDateDescInTimeDesc()) {
            if (Boolean.FALSE.equals(visitor.getIsActive())) {
                continue;
            }
            rows.add(toRow(visitor));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    private void ensureDemoVisitors() {
        if (visitorRepository.count() > 0) {
            return;
        }
        saveVisitor("Marketing", "Student", "Aman", "6456345353", "545", 5,
                LocalDate.of(2026, 8, 1), LocalTime.of(13, 13), LocalTime.of(14, 13), "");
        saveVisitor("Admission", "Principal", "Ravi Kumar", "9876501234", "221", 2,
                LocalDate.of(2026, 7, 15), LocalTime.of(11, 0), LocalTime.of(11, 45), "");
        saveVisitor("Enquiry", "Admin Office", "Teacher", "9988776655", "GovtID", 1,
                LocalDate.of(2026, 6, 10), LocalTime.of(9, 30), LocalTime.of(10, 15), "");
        saveVisitor("Parent Teacher Meeting", "Class Teacher", "Jaya", "786534538", "", 0,
                LocalDate.of(2026, 4, 1), LocalTime.of(18, 40), LocalTime.of(18, 40), "");
        saveVisitor("Marketing", "Principal", "Aman", "9876543210", "101", 3,
                LocalDate.of(2026, 3, 12), LocalTime.of(10, 0), LocalTime.of(10, 30), "");
    }

    private void saveVisitor(String purpose, String meetingWith, String visitorName, String phone,
                             String idCard, int numberOfPerson, LocalDate date,
                             LocalTime inTime, LocalTime outTime, String note) {
        Visitor visitor = Visitor.builder()
                .purpose(purpose)
                .meetingWith(meetingWith)
                .visitorName(visitorName)
                .phone(phone)
                .idCard(idCard == null || idCard.isBlank() ? " " : idCard)
                .numberOfPerson(numberOfPerson)
                .date(date)
                .inTime(inTime)
                .outTime(outTime)
                .note(note)
                .build();
        visitor.setIsActive(true);
        visitorRepository.save(visitor);
    }

    private Map<String, Object> toRow(Visitor visitor) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", visitor.getId());
        row.put("purpose", text(visitor.getPurpose()));
        row.put("visitorName", text(visitor.getVisitorName()));
        row.put("phone", text(visitor.getPhone()));
        row.put("idCard", text(visitor.getIdCard()));
        row.put("numberOfPerson", visitor.getNumberOfPerson() == null ? 0 : visitor.getNumberOfPerson());
        row.put("note", text(visitor.getNote()));
        row.put("date", visitor.getDate() == null ? "" : visitor.getDate().format(US_DATE));
        row.put("dateIso", visitor.getDate() == null ? "" : visitor.getDate().toString());
        row.put("inTime", formatTime(visitor.getInTime()));
        row.put("inTimeIso", visitor.getInTime() == null ? "" : visitor.getInTime().toString());
        row.put("outTime", formatTime(visitor.getOutTime()));
        row.put("outTimeIso", visitor.getOutTime() == null ? "" : visitor.getOutTime().toString());
        return row;
    }

    private String formatTime(LocalTime time) {
        return time == null ? "" : time.format(US_TIME);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
