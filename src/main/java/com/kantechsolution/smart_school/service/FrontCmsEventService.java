package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.FrontCmsEvent;
import com.kantechsolution.smart_school.repository.FrontCmsEventRepository;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Order(21)
public class FrontCmsEventService implements ApplicationRunner {

    private final FrontCmsEventRepository repository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        saveSeed("Math Exhibition Model", LocalDate.of(2026, 3, 18), LocalDate.of(2026, 3, 20), "school hall",
                "Students present math models and projects that show how numbers are used in daily life.");
        saveSeed("Science Exhibition", LocalDate.of(2026, 2, 13), LocalDate.of(2026, 2, 13), "school campus",
                "A school-wide science exhibition with student experiments, models, and live demonstrations.");
        saveSeed("Annual Cultural Program", LocalDate.of(2026, 4, 5), LocalDate.of(2026, 4, 6), "Class Room",
                "Annual cultural performances by students, including music, dance, and drama.");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list() {
        return repository.findAllByOrderByStartDateDescIdDesc().stream().map(this::toMap).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(Long id) {
        return toMap(require(id));
    }

    @Transactional
    public Map<String, Object> save(Long id, Map<String, Object> body) {
        String title = text(body.get("title"));
        LocalDate startDate = dateVal(body.get("startDate"));
        LocalDate endDate = dateVal(body.get("endDate"));
        if (title.isBlank()) throw new IllegalArgumentException("Title is required");
        if (startDate == null) throw new IllegalArgumentException("Event start date is required");
        if (endDate == null) throw new IllegalArgumentException("Event end date is required");
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Event end date cannot be before start date");
        }
        FrontCmsEvent event = id == null ? new FrontCmsEvent() : require(id);
        event.setTitle(title);
        event.setStartDate(startDate);
        event.setEndDate(endDate);
        event.setVenue(text(body.get("venue")));
        event.setDescription(text(body.get("description")));
        event.setShowSidebar(bool(body.get("showSidebar"), true));
        event.setMessageToStudent(bool(body.get("messageToStudent"), false));
        event.setMessageToGuardian(bool(body.get("messageToGuardian"), false));
        event.setMessageToStaff(bool(body.get("messageToStaff"), false));
        event.setMetaTitle(text(body.get("metaTitle")));
        event.setMetaKeyword(text(body.get("metaKeyword")));
        event.setMetaDescription(text(body.get("metaDescription")));
        if (bool(body.get("removeImage"), false)) {
            event.setImageUrl(null);
        }
        if (event.getIsActive() == null) event.setIsActive(true);
        return toMap(repository.save(event));
    }

    @Transactional
    public Map<String, Object> storeImage(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image is required");
        }
        FrontCmsEvent event = require(id);
        event.setImageUrl(storeEventImage(file));
        return toMap(repository.save(event));
    }

    public Map<String, Object> storeMedia(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("url", storeEventImage(file));
        map.put("name", file.getOriginalFilename());
        return map;
    }

    @Transactional
    public Map<String, Object> removeImage(Long id) {
        FrontCmsEvent event = require(id);
        event.setImageUrl(null);
        return toMap(repository.save(event));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(require(id));
    }

    private void saveSeed(String title, LocalDate start, LocalDate end, String venue, String description) {
        FrontCmsEvent event = FrontCmsEvent.builder()
                .title(title)
                .startDate(start)
                .endDate(end)
                .venue(venue)
                .description(description)
                .showSidebar(true)
                .build();
        event.setIsActive(true);
        repository.save(event);
    }

    private FrontCmsEvent require(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }

    private Map<String, Object> toMap(FrontCmsEvent event) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", event.getId());
        map.put("title", event.getTitle());
        map.put("startDate", event.getStartDate());
        map.put("endDate", event.getEndDate());
        map.put("venue", event.getVenue());
        map.put("description", event.getDescription());
        map.put("imageUrl", event.getImageUrl());
        map.put("showSidebar", Boolean.TRUE.equals(event.getShowSidebar()));
        map.put("messageToStudent", Boolean.TRUE.equals(event.getMessageToStudent()));
        map.put("messageToGuardian", Boolean.TRUE.equals(event.getMessageToGuardian()));
        map.put("messageToStaff", Boolean.TRUE.equals(event.getMessageToStaff()));
        map.put("metaTitle", event.getMetaTitle());
        map.put("metaKeyword", event.getMetaKeyword());
        map.put("metaDescription", event.getMetaDescription());
        return map;
    }

    private String storeEventImage(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "event";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        try {
            Path uploadDir = uploadStorage.getEventsDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/events/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store event image: " + e.getMessage());
        }
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static boolean bool(Object value, boolean fallback) {
        if (value == null || text(value).isBlank()) return fallback;
        if (value instanceof Boolean flag) return flag;
        String text = text(value).toLowerCase(Locale.ROOT);
        return "true".equals(text) || "1".equals(text) || "yes".equals(text);
    }

    private static LocalDate dateVal(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        return LocalDate.parse(text.contains("T") ? text.substring(0, 10) : text);
    }
}
