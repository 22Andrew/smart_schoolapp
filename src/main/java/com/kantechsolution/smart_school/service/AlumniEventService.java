package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.AlumniEvent;
import com.kantechsolution.smart_school.repository.AlumniEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(26)
public class AlumniEventService implements ApplicationRunner {

    private final AlumniEventRepository eventRepository;
    private final UploadStorage uploadStorage;

    private static final String CHRISTMAS_NOTE =
            "The programs related to the birth of Jesus Christ are prepared and presented by the students and teachers.";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (eventRepository.count() == 0) {
            seed("Christmas Celebration", LocalDate.of(2025, 12, 22), LocalDate.of(2025, 12, 26), CHRISTMAS_NOTE);
            seed("New Academic admission start (2025-26)", LocalDate.of(2025, 4, 1), LocalDate.of(2025, 4, 15), null);
            seed("Government scholarship exam, 2024", LocalDate.of(2024, 10, 14), LocalDate.of(2024, 10, 20), null);
        } else {
            eventRepository.findAll().stream()
                    .filter(row -> "Christmas Celebration".equals(row.getTitle())
                            && (row.getNote() == null || row.getNote().isBlank()))
                    .forEach(row -> {
                        row.setNote(CHRISTMAS_NOTE);
                        row.setNotificationMessage(CHRISTMAS_NOTE);
                        eventRepository.save(row);
                    });
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list() {
        return eventRepository.findAllByOrderByFromDateDescIdDesc().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> save(Long id, Map<String, String> fields, MultipartFile photo, boolean removePhoto) {
        String title = text(fields.get("title"));
        if (title.isBlank()) throw new IllegalArgumentException("Event Title is required");
        LocalDate fromDate = dateVal(fields.get("fromDate"));
        LocalDate toDate = dateVal(fields.get("toDate"));
        if (fromDate == null) throw new IllegalArgumentException("Event From Date is required");
        if (toDate == null) throw new IllegalArgumentException("Event To Date is required");
        String eventFor = text(fields.get("eventFor"));
        if (!"CLASS".equalsIgnoreCase(eventFor)) eventFor = "ALL";

        AlumniEvent row = id == null ? new AlumniEvent() : require(id);
        row.setEventFor(eventFor.toUpperCase(Locale.ROOT));
        row.setTitle(title);
        row.setFromDate(fromDate);
        row.setToDate(toDate);
        row.setNote(text(fields.get("note")));
        row.setNotificationMessage(text(fields.get("notificationMessage")));
        row.setNotifyEmail(bool(fields.get("notifyEmail")));
        row.setNotifySms(bool(fields.get("notifySms")));
        row.setSmsTemplateId(text(fields.get("smsTemplateId")));
        if ("CLASS".equals(row.getEventFor())) {
            row.setClassId(longVal(fields.get("classId")));
            row.setClassName(text(fields.get("className")));
            row.setSectionName(text(fields.get("sectionName")));
            row.setSessionId(longVal(fields.get("sessionId")));
            row.setSessionName(text(fields.get("sessionName")));
        } else {
            row.setClassId(null);
            row.setClassName("All");
            row.setSectionName(null);
            row.setSessionId(null);
            row.setSessionName(null);
        }
        if (removePhoto) row.setPhotoUrl(null);
        if (photo != null && !photo.isEmpty()) row.setPhotoUrl(storePhoto(photo));
        if (row.getIsActive() == null) row.setIsActive(true);
        return toMap(eventRepository.save(row));
    }

    @Transactional
    public void delete(Long id) {
        eventRepository.delete(require(id));
    }

    private void seed(String title, LocalDate from, LocalDate to, String note) {
        AlumniEvent row = AlumniEvent.builder()
                .eventFor("ALL")
                .title(title)
                .className("All")
                .fromDate(from)
                .toDate(to)
                .note(note)
                .notificationMessage(note)
                .notifyEmail(false)
                .notifySms(false)
                .build();
        row.setIsActive(true);
        eventRepository.save(row);
    }

    private AlumniEvent require(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    private Map<String, Object> toMap(AlumniEvent row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("eventFor", row.getEventFor());
        map.put("title", row.getTitle());
        map.put("classId", row.getClassId());
        map.put("className", row.getClassName());
        map.put("classSection", classSection(row));
        map.put("sectionName", row.getSectionName());
        map.put("sessionId", row.getSessionId());
        map.put("sessionName", row.getSessionName());
        map.put("fromDate", row.getFromDate());
        map.put("toDate", row.getToDate());
        map.put("photoUrl", row.getPhotoUrl());
        map.put("note", row.getNote());
        map.put("notificationMessage", row.getNotificationMessage());
        map.put("notifyEmail", Boolean.TRUE.equals(row.getNotifyEmail()));
        map.put("notifySms", Boolean.TRUE.equals(row.getNotifySms()));
        map.put("smsTemplateId", row.getSmsTemplateId());
        return map;
    }

    private static String classSection(AlumniEvent row) {
        if (!"CLASS".equalsIgnoreCase(row.getEventFor())) return "All";
        String className = text(row.getClassName());
        String section = text(row.getSectionName());
        if (!className.isBlank() && !section.isBlank()) return className + "(" + section + ")";
        return className.isBlank() ? "Class" : className;
    }

    private String storePhoto(MultipartFile file) {
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT) : "";
        try {
            Path dir = uploadStorage.getAlumniDir().resolve("events");
            Files.createDirectories(dir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/alumni/events/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store photo: " + e.getMessage());
        }
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static boolean bool(Object value) {
        String text = text(value).toLowerCase(Locale.ROOT);
        return "true".equals(text) || "1".equals(text) || "on".equals(text) || "yes".equals(text);
    }

    private static Long longVal(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static LocalDate dateVal(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        return LocalDate.parse(text.contains("T") ? text.substring(0, 10) : text);
    }
}
