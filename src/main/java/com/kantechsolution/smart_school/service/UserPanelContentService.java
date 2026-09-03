package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ContentShareLog;
import com.kantechsolution.smart_school.model.DownloadContent;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.ContentShareLogRepository;
import com.kantechsolution.smart_school.repository.DownloadContentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class UserPanelContentService {

    private static final DateTimeFormatter US_DATE = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private static final List<DemoShare> DEMO_SHARES = List.of(
            new DemoShare("Fees Structure", LocalDate.of(2026, 5, 22), LocalDate.of(2026, 5, 30)),
            new DemoShare("School Admission", LocalDate.of(2026, 5, 4), LocalDate.of(2026, 5, 14)),
            new DemoShare("Fees", LocalDate.of(2026, 4, 2), LocalDate.of(2026, 4, 30)),
            new DemoShare("Admission", LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 31)),
            new DemoShare("share all", LocalDate.of(2026, 2, 2), LocalDate.of(2026, 2, 27)),
            new DemoShare("New CBSE Books List", LocalDate.of(2026, 1, 2), LocalDate.of(2026, 1, 31)),
            new DemoShare("Fess Updates Structure", LocalDate.of(2025, 12, 2), LocalDate.of(2025, 12, 31)),
            new DemoShare("New Books Collection", LocalDate.of(2025, 11, 4), LocalDate.of(2025, 11, 30)),
            new DemoShare("New Study Material Books", LocalDate.of(2025, 10, 2), LocalDate.of(2025, 10, 31)),
            new DemoShare("Update Fees Details", LocalDate.of(2025, 9, 2), LocalDate.of(2025, 9, 30))
    );

    private final ContentShareLogRepository contentShareLogRepository;
    private final DownloadContentRepository downloadContentRepository;
    private final UserPanelContextService contextService;

    public UserPanelContentService(ContentShareLogRepository contentShareLogRepository,
                                   DownloadContentRepository downloadContentRepository,
                                   UserPanelContextService contextService) {
        this.contentShareLogRepository = contentShareLogRepository;
        this.downloadContentRepository = downloadContentRepository;
        this.contextService = contextService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listContents(Authentication authentication) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (ContentShareLog log : contentShareLogRepository.findAllByOrderByShareDateDescCreatedAtDesc()) {
            if (Boolean.FALSE.equals(log.getIsActive()) || !visibleToStudent(log, student)) {
                continue;
            }
            rows.add(toRow(log));
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("rows", rows);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getContent(Authentication authentication, Long id) {
        StudentAdmission student = contextService.resolveStudent(authentication);
        ContentShareLog log = contentShareLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Content not found"));
        if (Boolean.FALSE.equals(log.getIsActive()) || !visibleToStudent(log, student)) {
            throw new IllegalArgumentException("Content not found");
        }
        return toRow(log);
    }

    private void ensureDemoShares() {
        if (contentShareLogRepository.count() > 0) {
            return;
        }
        String contentId = String.valueOf(ensureDemoFile().getId());
        for (DemoShare demo : DEMO_SHARES) {
            ContentShareLog log = ContentShareLog.builder()
                    .title(demo.title())
                    .shareDate(demo.shareDate())
                    .validUntil(demo.validUntil())
                    .description("")
                    .sendToType("Group")
                    .sendToDetails("")
                    .recipientRoles("Student")
                    .contentIds(contentId)
                    .contentTitles(demo.title())
                    .sharedBy("")
                    .build();
            log.setIsActive(true);
            contentShareLogRepository.save(log);
        }
    }

    private DownloadContent ensureDemoFile() {
        List<DownloadContent> existing = downloadContentRepository.findAllByOrderByCreatedAtDesc();
        if (!existing.isEmpty()) {
            return existing.get(0);
        }
        DownloadContent content = DownloadContent.builder()
                .title("Shared Document")
                .contentType("Documents")
                .uploadType("FILE")
                .uploadedBy("")
                .build();
        content.setIsActive(true);
        return downloadContentRepository.save(content);
    }

    private boolean visibleToStudent(ContentShareLog log, StudentAdmission student) {
        String roles = text(log.getRecipientRoles()).toLowerCase(Locale.ROOT);
        if (!roles.isBlank() && !roles.contains("student")) {
            return false;
        }
        String sendToType = text(log.getSendToType());
        String details = text(log.getSendToDetails()).toLowerCase(Locale.ROOT);
        if (sendToType.equalsIgnoreCase("Class")) {
            String className = className(student).toLowerCase(Locale.ROOT);
            String section = section(student).toLowerCase(Locale.ROOT);
            if (!className.isBlank() && !details.contains(className)) {
                return false;
            }
            return section.isBlank() || details.isBlank() || details.contains(section);
        }
        if (sendToType.equalsIgnoreCase("Individual")) {
            if (details.isBlank()) {
                return true;
            }
            String name = contextService.resolveStudentName(student).toLowerCase(Locale.ROOT);
            String admissionNo = contextService.resolveAdmissionNo(student).toLowerCase(Locale.ROOT);
            return details.contains(name) || details.contains(admissionNo);
        }
        return true;
    }

    private Map<String, Object> toRow(ContentShareLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("title", text(log.getTitle()));
        row.put("shareDate", formatDate(log.getShareDate()));
        row.put("shareDateIso", log.getShareDate() == null ? "" : log.getShareDate().toString());
        row.put("validUntil", formatDate(log.getValidUntil()));
        row.put("validUntilIso", log.getValidUntil() == null ? "" : log.getValidUntil().toString());
        row.put("sharedBy", text(log.getSharedBy()));
        row.put("description", text(log.getDescription()));
        row.put("files", resolveFiles(log.getContentIds()));
        return row;
    }

    private List<Map<String, Object>> resolveFiles(String contentIds) {
        List<Long> ids = parseIdList(contentIds);
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, DownloadContent> byId = downloadContentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(DownloadContent::getId, item -> item, (a, b) -> a));
        List<Map<String, Object>> files = new ArrayList<>();
        for (Long id : ids) {
            DownloadContent content = byId.get(id);
            if (content == null || Boolean.FALSE.equals(content.getIsActive())) {
                continue;
            }
            Map<String, Object> file = new LinkedHashMap<>();
            file.put("id", content.getId());
            file.put("title", text(content.getTitle()));
            file.put("uploadType", text(content.getUploadType()));
            file.put("filePath", text(content.getFilePath()));
            file.put("fileName", text(content.getFileName()));
            file.put("youtubeUrl", text(content.getYoutubeUrl()));
            files.add(file);
        }
        return files;
    }

    private List<Long> parseIdList(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .map(item -> {
                    try {
                        return Long.parseLong(item);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();
    }

    private String className(StudentAdmission student) {
        if (student != null && student.getSchoolClass() != null && student.getSchoolClass().getName() != null) {
            return student.getSchoolClass().getName().trim();
        }
        return "";
    }

    private String section(StudentAdmission student) {
        if (student != null && student.getSection() != null) {
            return student.getSection().trim();
        }
        return "";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.format(US_DATE);
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private record DemoShare(String title, LocalDate shareDate, LocalDate validUntil) {
    }
}
