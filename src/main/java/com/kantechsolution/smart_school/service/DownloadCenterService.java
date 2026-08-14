package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.ContentShareLog;
import com.kantechsolution.smart_school.model.ContentTypeSetting;
import com.kantechsolution.smart_school.model.DownloadContent;
import com.kantechsolution.smart_school.model.VideoTutorial;
import com.kantechsolution.smart_school.repository.ContentShareLogRepository;
import com.kantechsolution.smart_school.repository.ContentTypeSettingRepository;
import com.kantechsolution.smart_school.repository.DownloadContentRepository;
import com.kantechsolution.smart_school.repository.VideoTutorialRepository;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Order(20)
public class DownloadCenterService implements ApplicationRunner {

    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final List<String> DEFAULT_CONTENT_TYPES = List.of(
            "Documents", "Images", "Video", "Audio", "Other"
    );

    private final ContentTypeSettingRepository contentTypeSettingRepository;
    private final DownloadContentRepository downloadContentRepository;
    private final ContentShareLogRepository contentShareLogRepository;
    private final VideoTutorialRepository videoTutorialRepository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (contentTypeSettingRepository.count() == 0) {
            DEFAULT_CONTENT_TYPES.forEach(name -> contentTypeSettingRepository.save(
                    ContentTypeSetting.builder().name(name).description(name + " content").build()
            ));
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listContentTypes() {
        return contentTypeSettingRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::contentTypeToMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listContents() {
        return downloadContentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::contentToMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listShareLogs() {
        return contentShareLogRepository.findAllByOrderByShareDateDescCreatedAtDesc()
                .stream()
                .map(this::shareLogToMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> saveContent(Map<String, Object> payload, MultipartFile file) {
        Long id = parseLong(payload.get("id"));
        DownloadContent content = id != null
                ? downloadContentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Content not found"))
                : DownloadContent.builder().build();

        content.setTitle(requiredText(payload.get("title"), "Title"));
        content.setContentType(requiredText(payload.get("contentType"), "Content type"));

        String uploadType = optionalText(payload.get("uploadType")).toUpperCase(Locale.ROOT);
        if (uploadType.isBlank()) {
            uploadType = "FILE";
        }

        if ("YOUTUBE".equals(uploadType)) {
            String youtubeUrl = requiredText(payload.get("youtubeUrl"), "YouTube URL");
            content.setUploadType("YOUTUBE");
            content.setYoutubeUrl(youtubeUrl);
            if (id == null) {
                content.setFilePath(null);
                content.setFileName(null);
            }
        } else {
            content.setUploadType("FILE");
            content.setYoutubeUrl(null);
            if (file != null && !file.isEmpty()) {
                content.setFilePath(storeContentFile(file));
                content.setFileName(file.getOriginalFilename());
                content.setFileSize(file.getSize());
            } else if (id == null) {
                throw new IllegalArgumentException("File is required");
            }
        }

        if (content.getUploadedBy() == null || content.getUploadedBy().isBlank()) {
            content.setUploadedBy("Joe Black (9000)");
        }

        content.setIsActive(true);
        return contentToMap(downloadContentRepository.save(content));
    }

    @Transactional
    public void deleteContent(Long id) {
        if (!downloadContentRepository.existsById(id)) {
            throw new IllegalArgumentException("Content not found");
        }
        downloadContentRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> shareContent(Map<String, Object> payload) {
        List<Long> contentIds = parseIdList(payload.get("contentIds"));
        if (contentIds.isEmpty()) {
            throw new IllegalArgumentException("Select at least one content item");
        }

        List<DownloadContent> contents = downloadContentRepository.findAllById(contentIds);
        if (contents.isEmpty()) {
            throw new IllegalArgumentException("Selected content not found");
        }

        ContentShareLog log = ContentShareLog.builder()
                .title(requiredText(payload.get("title"), "Title"))
                .shareDate(parseDate(payload.get("shareDate"), "Share date"))
                .validUntil(parseDate(payload.get("validUntil"), "Valid until date"))
                .description(optionalText(payload.get("description")))
                .sendToType(requiredText(payload.get("sendToType"), "Send to"))
                .sendToDetails(optionalText(payload.get("sendToDetails")))
                .recipientRoles(optionalText(payload.get("recipientRoles")))
                .contentIds(contentIds.stream().map(String::valueOf).collect(Collectors.joining(",")))
                .contentTitles(contents.stream().map(DownloadContent::getTitle).collect(Collectors.joining(", ")))
                .sharedBy(optionalText(payload.get("sharedBy")).isBlank() ? "Joe Black (9000)" : optionalText(payload.get("sharedBy")))
                .build();
        log.setIsActive(true);

        return shareLogToMap(contentShareLogRepository.save(log));
    }

    @Transactional
    public Map<String, Object> saveContentType(Map<String, Object> payload) {
        Long id = parseLong(payload.get("id"));
        String name = requiredText(payload.get("name"), "Name");

        if (id != null) {
            if (contentTypeSettingRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
                throw new IllegalArgumentException("Content type already exists");
            }
            ContentTypeSetting type = contentTypeSettingRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Content type not found"));
            type.setName(name);
            type.setDescription(optionalText(payload.get("description")));
            return contentTypeToMap(contentTypeSettingRepository.save(type));
        }

        if (contentTypeSettingRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Content type already exists");
        }

        ContentTypeSetting type = ContentTypeSetting.builder()
                .name(name)
                .description(optionalText(payload.get("description")))
                .build();
        type.setIsActive(true);
        return contentTypeToMap(contentTypeSettingRepository.save(type));
    }

    @Transactional
    public void deleteContentType(Long id) {
        if (!contentTypeSettingRepository.existsById(id)) {
            throw new IllegalArgumentException("Content type not found");
        }
        contentTypeSettingRepository.deleteById(id);
    }

    @Transactional
    public void deleteShareLog(Long id) {
        if (!contentShareLogRepository.existsById(id)) {
            throw new IllegalArgumentException("Share record not found");
        }
        contentShareLogRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listVideoTutorials() {
        return videoTutorialRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::videoTutorialToMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> saveVideoTutorial(Map<String, Object> payload) {
        Long id = parseLong(payload.get("id"));
        VideoTutorial tutorial = id != null
                ? videoTutorialRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Video tutorial not found"))
                : VideoTutorial.builder().build();

        tutorial.setClassName(requiredText(payload.get("className"), "Class"));
        tutorial.setSection(requiredText(payload.get("section"), "Section"));
        tutorial.setTitle(requiredText(payload.get("title"), "Title"));
        tutorial.setVideoLink(requiredText(payload.get("videoLink"), "Video link"));
        tutorial.setDescription(optionalText(payload.get("description")));

        String createdBy = optionalText(payload.get("createdBy"));
        tutorial.setCreatedBy(createdBy.isBlank()
                ? (tutorial.getCreatedBy() != null ? tutorial.getCreatedBy() : "Admin")
                : createdBy);
        tutorial.setIsActive(true);

        return videoTutorialToMap(videoTutorialRepository.save(tutorial));
    }

    @Transactional
    public void deleteVideoTutorial(Long id) {
        if (!videoTutorialRepository.existsById(id)) {
            throw new IllegalArgumentException("Video tutorial not found");
        }
        videoTutorialRepository.deleteById(id);
    }

    private Map<String, Object> videoTutorialToMap(VideoTutorial tutorial) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", tutorial.getId());
        map.put("className", tutorial.getClassName());
        map.put("section", tutorial.getSection());
        map.put("title", tutorial.getTitle());
        map.put("videoLink", tutorial.getVideoLink());
        map.put("description", tutorial.getDescription());
        map.put("createdBy", tutorial.getCreatedBy());
        map.put("createdAt", formatDateTime(tutorial.getCreatedAt()));
        return map;
    }

    private String storeContentFile(MultipartFile file) {
        try {
            Path uploadDir = uploadStorage.getContentsDir();
            Files.createDirectories(uploadDir);
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String extension = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                extension = original.substring(dot);
            }
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/contents/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store file: " + e.getMessage());
        }
    }

    private Map<String, Object> contentToMap(DownloadContent content) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", content.getId());
        map.put("title", content.getTitle());
        map.put("contentType", content.getContentType());
        map.put("uploadType", content.getUploadType());
        map.put("filePath", content.getFilePath());
        map.put("fileName", content.getFileName());
        map.put("youtubeUrl", content.getYoutubeUrl());
        map.put("uploadedBy", content.getUploadedBy());
        map.put("fileSize", content.getFileSize());
        map.put("createdAt", formatDateTime(content.getCreatedAt()));
        return map;
    }

    private Map<String, Object> contentTypeToMap(ContentTypeSetting type) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", type.getId());
        map.put("name", type.getName());
        map.put("description", type.getDescription());
        return map;
    }

    private Map<String, Object> shareLogToMap(ContentShareLog log) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", log.getId());
        map.put("title", log.getTitle());
        map.put("shareDate", log.getShareDate() != null ? log.getShareDate().toString() : null);
        map.put("validUntil", log.getValidUntil() != null ? log.getValidUntil().toString() : null);
        map.put("description", log.getDescription());
        map.put("sendToType", log.getSendToType());
        map.put("sendToDetails", log.getSendToDetails());
        map.put("recipientRoles", log.getRecipientRoles());
        map.put("contentIds", log.getContentIds());
        map.put("contentTitles", log.getContentTitles());
        map.put("sharedBy", log.getSharedBy());
        map.put("createdAt", formatDateTime(log.getCreatedAt()));
        return map;
    }

    private List<Long> parseIdList(Object value) {
        if (value == null) {
            return List.of();
        }
        if (value instanceof Collection<?> collection) {
            return collection.stream()
                    .map(this::parseLong)
                    .filter(Objects::nonNull)
                    .toList();
        }
        String text = String.valueOf(value).trim();
        if (text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(text.split(","))
                .map(String::trim)
                .filter(part -> !part.isBlank())
                .map(this::parseLong)
                .filter(Objects::nonNull)
                .toList();
    }

    private Long parseLong(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        return Long.parseLong(String.valueOf(value));
    }

    private String requiredText(Object value, String label) {
        String text = optionalText(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return text;
    }

    private String optionalText(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private LocalDate parseDate(Object value, String label) {
        String text = optionalText(value);
        if (text.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return LocalDate.parse(text);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DATE_TIME_FORMAT);
    }
}
