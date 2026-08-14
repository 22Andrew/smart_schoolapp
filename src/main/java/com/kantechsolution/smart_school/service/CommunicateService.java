package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunicateService {

    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final NoticeBoardRepository noticeBoardRepository;
    private final CommunicateMessageLogRepository messageLogRepository;
    private final CommunicateEmailTemplateRepository emailTemplateRepository;
    private final CommunicateSmsTemplateRepository smsTemplateRepository;
    private final LoginCredentialSendLogRepository loginCredentialSendLogRepository;
    private final UploadStorage uploadStorage;
    private final StudentAdmissionRepository studentAdmissionRepository;

    // ---------- Notice Board ----------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listNotices() {
        return noticeBoardRepository.findAllByOrderByNoticeDateDescCreatedAtDesc()
                .stream().map(this::noticeToMap).toList();
    }

    @Transactional
    public Map<String, Object> saveNotice(Map<String, Object> payload) {
        return saveNotice(payload, null);
    }

    @Transactional
    public Map<String, Object> saveNotice(Map<String, Object> payload, MultipartFile attachment) {
        Long id = parseLong(payload.get("id"));
        NoticeBoard notice = id != null
                ? noticeBoardRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Notice not found"))
                : NoticeBoard.builder().build();

        notice.setTitle(requiredText(payload.get("title"), "Title"));
        notice.setMessage(requiredText(payload.get("message"), "Message"));
        notice.setNoticeDate(parseDate(payload.get("noticeDate"), "Notice date"));

        if (payload.containsKey("publishOn") && payload.get("publishOn") != null && !String.valueOf(payload.get("publishOn")).isBlank()) {
            notice.setPublishOn(parseDate(payload.get("publishOn"), "Publish on"));
        } else if (notice.getPublishOn() == null) {
            notice.setPublishOn(notice.getNoticeDate());
        }

        String messageTo = optionalText(payload.get("messageTo"));
        if (!messageTo.isBlank()) {
            notice.setMessageTo(messageTo);
            notice.setPublishTo(messageTo.contains(",") ? "Multiple" : messageTo);
        } else if (notice.getPublishTo() == null || notice.getPublishTo().isBlank()) {
            notice.setPublishTo(requiredText(payload.get("publishTo"), "Message to"));
        }

        notice.setSendByEmail(parseBoolean(payload.get("sendByEmail"), false));
        notice.setSendBySms(parseBoolean(payload.get("sendBySms"), false));
        notice.setShowOnWebsite(parseBoolean(payload.get("showOnWebsite"), true));

        if (attachment != null && !attachment.isEmpty()) {
            notice.setAttachmentPath(storeNoticeAttachment(attachment));
        } else if (payload.containsKey("attachmentPath")) {
            notice.setAttachmentPath(optionalText(payload.get("attachmentPath")));
        }

        notice.setIsActive(true);
        return noticeToMap(noticeBoardRepository.save(notice));
    }

    @Transactional
    public void deleteNotice(Long id) {
        if (!noticeBoardRepository.existsById(id)) {
            throw new IllegalArgumentException("Notice not found");
        }
        noticeBoardRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllNotices() {
        noticeBoardRepository.deleteAll();
    }

    // ---------- Messages (Email / SMS) ----------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listMessageLogs(String messageType, String status) {
        List<CommunicateMessageLog> logs;
        if (status != null && !status.isBlank()) {
            logs = messageLogRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        } else if (messageType != null && !messageType.isBlank()) {
            logs = messageLogRepository.findByMessageTypeOrderByCreatedAtDesc(messageType.trim().toUpperCase());
        } else {
            logs = messageLogRepository.findAllByOrderByCreatedAtDesc();
        }

        if (messageType != null && !messageType.isBlank() && status != null && !status.isBlank()) {
            String type = messageType.trim().toUpperCase();
            String stat = status.trim().toUpperCase();
            logs = logs.stream()
                    .filter(log -> type.equals(log.getMessageType()) && stat.equals(log.getStatus()))
                    .toList();
        } else if (messageType != null && !messageType.isBlank() && (status == null || status.isBlank())) {
            String type = messageType.trim().toUpperCase();
            logs = logs.stream().filter(log -> type.equals(log.getMessageType())).toList();
        }

        return logs.stream().map(this::messageToMap).toList();
    }

    @Transactional
    public Map<String, Object> sendMessage(Map<String, Object> payload) {
        String messageType = requiredText(payload.get("messageType"), "Message type").toUpperCase();
        if (!messageType.equals("EMAIL") && !messageType.equals("SMS")) {
            throw new IllegalArgumentException("Message type must be EMAIL or SMS");
        }

        CommunicateMessageLog log = CommunicateMessageLog.builder()
                .messageType(messageType)
                .title(requiredText(payload.get("title"), "Title"))
                .message(requiredText(payload.get("message"), "Message"))
                .recipientType(requiredText(payload.get("recipientType"), "Recipient type"))
                .recipientDetails(optionalText(payload.get("recipientDetails")))
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
        log.setIsActive(true);
        return messageToMap(messageLogRepository.save(log));
    }

    @Transactional
    public Map<String, Object> scheduleMessage(Map<String, Object> payload) {
        String messageType = requiredText(payload.get("messageType"), "Message type").toUpperCase();
        LocalDateTime scheduledAt = parseDateTime(payload.get("scheduledAt"), "Schedule date & time");

        CommunicateMessageLog log = CommunicateMessageLog.builder()
                .messageType(messageType)
                .title(requiredText(payload.get("title"), "Title"))
                .message(requiredText(payload.get("message"), "Message"))
                .recipientType(requiredText(payload.get("recipientType"), "Recipient type"))
                .recipientDetails(optionalText(payload.get("recipientDetails")))
                .status("SCHEDULED")
                .scheduledAt(scheduledAt)
                .build();
        log.setIsActive(true);
        return messageToMap(messageLogRepository.save(log));
    }

    @Transactional
    public void deleteMessageLog(Long id) {
        if (!messageLogRepository.existsById(id)) {
            throw new IllegalArgumentException("Message log not found");
        }
        messageLogRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllMessageLogs() {
        messageLogRepository.deleteAll();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listTodayBirthdayStudents() {
        LocalDate today = LocalDate.now();
        return studentAdmissionRepository.findActiveByBirthday(today.getMonthValue(), today.getDayOfMonth())
                .stream()
                .map(this::birthdayStudentToMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> sendEmailCompose(Map<String, Object> payload, MultipartFile attachment) {
        String sendMode = optionalText(payload.get("sendMode"));
        if (sendMode.isBlank()) {
            sendMode = "NOW";
        }
        sendMode = sendMode.toUpperCase(Locale.ROOT);

        CommunicateMessageLog log = CommunicateMessageLog.builder()
                .messageType("EMAIL")
                .title(requiredText(payload.get("title"), "Title"))
                .message(requiredText(payload.get("message"), "Message"))
                .recipientType(requiredText(payload.get("recipientType"), "Recipient type"))
                .recipientDetails(optionalText(payload.get("recipientDetails")))
                .composeTab(optionalText(payload.get("composeTab")))
                .emailTemplateId(parseLong(payload.get("emailTemplateId")))
                .sendMode(sendMode)
                .build();

        if (attachment != null && !attachment.isEmpty()) {
            log.setAttachmentPath(storeEmailAttachment(attachment));
        }

        if ("SCHEDULE".equals(sendMode)) {
            log.setStatus("SCHEDULED");
            log.setScheduledAt(parseDateTime(payload.get("scheduledAt"), "Schedule date & time"));
        } else {
            log.setStatus("SENT");
            log.setSentAt(LocalDateTime.now());
        }

        log.setIsActive(true);
        return messageToMap(messageLogRepository.save(log));
    }

    @Transactional
    public Map<String, Object> sendSmsCompose(Map<String, Object> payload) {
        String sendMode = optionalText(payload.get("sendMode"));
        if (sendMode.isBlank()) {
            sendMode = "NOW";
        }
        sendMode = sendMode.toUpperCase(Locale.ROOT);

        CommunicateMessageLog log = CommunicateMessageLog.builder()
                .messageType("SMS")
                .title(requiredText(payload.get("title"), "Title"))
                .message(requiredText(payload.get("message"), "Message"))
                .recipientType(requiredText(payload.get("recipientType"), "Recipient type"))
                .recipientDetails(optionalText(payload.get("recipientDetails")))
                .composeTab(optionalText(payload.get("composeTab")))
                .smsTemplateId(parseLong(payload.get("smsTemplateId")))
                .sendMode(sendMode)
                .build();

        if ("SCHEDULE".equals(sendMode)) {
            log.setStatus("SCHEDULED");
            log.setScheduledAt(parseDateTime(payload.get("scheduledAt"), "Schedule date & time"));
        } else {
            log.setStatus("SENT");
            log.setSentAt(LocalDateTime.now());
        }

        log.setIsActive(true);
        return messageToMap(messageLogRepository.save(log));
    }

    private Map<String, Object> birthdayStudentToMap(StudentAdmission student) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", student.getId());
        row.put("name", fullStudentName(student));
        row.put("admissionNo", student.getAdmissionNo());
        row.put("className", student.getSchoolClass() != null ? student.getSchoolClass().getName() : "");
        row.put("section", student.getSection());
        row.put("email", student.getEmail());
        row.put("mobileNumber", student.getMobileNumber());
        row.put("dateOfBirth", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "");
        return row;
    }

    private String fullStudentName(StudentAdmission student) {
        String first = student.getFirstName() != null ? student.getFirstName().trim() : "";
        String last = student.getLastName() != null ? student.getLastName().trim() : "";
        return (first + " " + last).trim();
    }

    private String storeEmailAttachment(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }

        try {
            Path uploadDir = uploadStorage.getEmailsDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/emails/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store attachment: " + e.getMessage());
        }
    }

    // ---------- Email Templates ----------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listEmailTemplates() {
        return emailTemplateRepository.findAllByOrderByTitleAsc().stream().map(this::emailTemplateToMap).toList();
    }

    @Transactional
    public Map<String, Object> saveEmailTemplate(Map<String, Object> payload) {
        return saveEmailTemplate(payload, null);
    }

    @Transactional
    public Map<String, Object> saveEmailTemplate(Map<String, Object> payload, MultipartFile attachment) {
        Long id = parseLong(payload.get("id"));
        String title = requiredText(payload.get("title"), "Title");
        String body = requiredText(payload.get("templateBody"), "Template body");

        if (id == null && emailTemplateRepository.findByTitleIgnoreCase(title).isPresent()) {
            throw new IllegalArgumentException("Email template already exists");
        }
        if (id != null && emailTemplateRepository.existsByTitleIgnoreCaseAndIdNot(title, id)) {
            throw new IllegalArgumentException("Email template already exists");
        }

        CommunicateEmailTemplate template = id != null
                ? emailTemplateRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Email template not found"))
                : CommunicateEmailTemplate.builder().build();
        template.setTitle(title);
        template.setTemplateBody(body);
        if (attachment != null && !attachment.isEmpty()) {
            template.setAttachmentPath(storeEmailTemplateAttachment(attachment));
        }
        template.setIsActive(true);
        return emailTemplateToMap(emailTemplateRepository.save(template));
    }

    @Transactional
    public void deleteEmailTemplate(Long id) {
        if (!emailTemplateRepository.existsById(id)) {
            throw new IllegalArgumentException("Email template not found");
        }
        emailTemplateRepository.deleteById(id);
    }

    // ---------- SMS Templates ----------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listSmsTemplates() {
        return smsTemplateRepository.findAllByOrderByTitleAsc().stream().map(this::smsTemplateToMap).toList();
    }

    @Transactional
    public Map<String, Object> saveSmsTemplate(Map<String, Object> payload) {
        Long id = parseLong(payload.get("id"));
        String title = requiredText(payload.get("title"), "Title");
        String body = requiredText(payload.get("templateBody"), "Template body");

        if (id == null && smsTemplateRepository.findByTitleIgnoreCase(title).isPresent()) {
            throw new IllegalArgumentException("SMS template already exists");
        }
        if (id != null && smsTemplateRepository.existsByTitleIgnoreCaseAndIdNot(title, id)) {
            throw new IllegalArgumentException("SMS template already exists");
        }

        CommunicateSmsTemplate template = id != null
                ? smsTemplateRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("SMS template not found"))
                : CommunicateSmsTemplate.builder().build();
        template.setTitle(title);
        template.setTemplateBody(body);
        template.setIsActive(true);
        return smsTemplateToMap(smsTemplateRepository.save(template));
    }

    @Transactional
    public void deleteSmsTemplate(Long id) {
        if (!smsTemplateRepository.existsById(id)) {
            throw new IllegalArgumentException("SMS template not found");
        }
        smsTemplateRepository.deleteById(id);
    }

    // ---------- Login Credential Send ----------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listLoginCredentialLogs() {
        return loginCredentialSendLogRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::loginCredentialToMap).toList();
    }

    @Transactional
    public Map<String, Object> sendLoginCredentials(Map<String, Object> payload) {
        String messageTo = optionalText(payload.get("messageTo"));
        String notificationType = optionalText(payload.get("notificationType"));
        String userType = !messageTo.isBlank() ? messageTo : requiredText(payload.get("userType"), "User type");
        String sendVia = !notificationType.isBlank() ? notificationType : requiredText(payload.get("sendVia"), "Send via");

        List<Long> studentIds = parseLongList(payload.get("studentIds"));
        String recipientType;
        String recipientDetails;

        if (!studentIds.isEmpty()) {
            recipientType = "Class";
            String classLabel = optionalText(payload.get("classLabel"));
            List<StudentAdmission> students = studentAdmissionRepository.findAllById(studentIds);
            String summary = students.stream()
                    .map(student -> {
                        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
                        String last = student.getLastName() == null ? "" : student.getLastName().trim();
                        String name = (first + " " + last).trim();
                        String admissionNo = student.getAdmissionNo() == null ? "" : student.getAdmissionNo().trim();
                        return admissionNo + (name.isBlank() ? "" : " - " + name);
                    })
                    .reduce((left, right) -> left + ", " + right)
                    .orElse("");
            recipientDetails = (classLabel.isBlank() ? "" : classLabel + ", ")
                    + studentIds.size() + " student(s): " + summary;
        } else {
            recipientType = requiredText(payload.get("recipientType"), "Recipient type");
            recipientDetails = optionalText(payload.get("recipientDetails"));
        }

        LoginCredentialSendLog log = LoginCredentialSendLog.builder()
                .userType(userType)
                .sendVia(sendVia)
                .recipientType(recipientType)
                .recipientDetails(recipientDetails)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
        log.setIsActive(true);
        return loginCredentialToMap(loginCredentialSendLogRepository.save(log));
    }

    @Transactional
    public void deleteLoginCredentialLog(Long id) {
        if (!loginCredentialSendLogRepository.existsById(id)) {
            throw new IllegalArgumentException("Login credential log not found");
        }
        loginCredentialSendLogRepository.deleteById(id);
    }

    // ---------- Mappers ----------

    private Map<String, Object> noticeToMap(NoticeBoard notice) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", notice.getId());
        row.put("title", notice.getTitle());
        row.put("message", notice.getMessage());
        row.put("noticeDate", notice.getNoticeDate() != null ? notice.getNoticeDate().toString() : "");
        row.put("publishOn", notice.getPublishOn() != null ? notice.getPublishOn().toString() : "");
        row.put("publishTo", notice.getPublishTo());
        row.put("messageTo", notice.getMessageTo());
        row.put("attachmentPath", notice.getAttachmentPath());
        row.put("sendByEmail", notice.getSendByEmail());
        row.put("sendBySms", notice.getSendBySms());
        row.put("showOnWebsite", notice.getShowOnWebsite());
        row.put("createdAt", formatDateTime(notice.getCreatedAt()));
        return row;
    }

    private String storeNoticeAttachment(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }

        try {
            Path uploadDir = uploadStorage.getNoticesDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/notices/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store attachment: " + e.getMessage());
        }
    }

    private String storeEmailTemplateAttachment(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }

        try {
            Path uploadDir = uploadStorage.getEmailsDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/emails/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store attachment: " + e.getMessage());
        }
    }

    private Map<String, Object> messageToMap(CommunicateMessageLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("messageType", log.getMessageType());
        row.put("title", log.getTitle());
        row.put("message", log.getMessage());
        row.put("recipientType", log.getRecipientType());
        row.put("recipientDetails", log.getRecipientDetails());
        row.put("status", log.getStatus());
        row.put("scheduledAt", formatDateTime(log.getScheduledAt()));
        row.put("sentAt", formatDateTime(log.getSentAt()));
        row.put("createdAt", formatDateTime(log.getCreatedAt()));
        row.put("composeTab", log.getComposeTab());
        row.put("attachmentPath", log.getAttachmentPath());
        row.put("emailTemplateId", log.getEmailTemplateId());
        row.put("smsTemplateId", log.getSmsTemplateId());
        row.put("sendMode", log.getSendMode());
        return row;
    }

    private Map<String, Object> emailTemplateToMap(CommunicateEmailTemplate template) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", template.getId());
        row.put("title", template.getTitle());
        row.put("templateBody", template.getTemplateBody());
        row.put("attachmentPath", template.getAttachmentPath());
        return row;
    }

    private Map<String, Object> smsTemplateToMap(CommunicateSmsTemplate template) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", template.getId());
        row.put("title", template.getTitle());
        row.put("templateBody", template.getTemplateBody());
        return row;
    }

    private Map<String, Object> loginCredentialToMap(LoginCredentialSendLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("userType", log.getUserType());
        row.put("sendVia", log.getSendVia());
        row.put("recipientType", log.getRecipientType());
        row.put("recipientDetails", log.getRecipientDetails());
        row.put("status", log.getStatus());
        row.put("sentAt", formatDateTime(log.getSentAt()));
        row.put("createdAt", formatDateTime(log.getCreatedAt()));
        return row;
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMAT);
    }

    private String requiredText(Object value, String field) {
        String text = value == null ? "" : value.toString().trim();
        if (text.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return text;
    }

    private String optionalText(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private Boolean parseBoolean(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private LocalDate parseDate(Object value, String field) {
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return LocalDate.parse(value.toString().trim());
    }

    private LocalDateTime parseDateTime(Object value, String field) {
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        String text = value.toString().trim();
        if (text.length() == 16) {
            return LocalDateTime.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        }
        if (text.length() == 19 && text.charAt(10) == ' ') {
            return LocalDateTime.parse(text, DATE_TIME_FORMAT);
        }
        return LocalDateTime.parse(text);
    }

    private Long parseLong(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return Long.parseLong(value.toString());
    }

    private List<Long> parseLongList(Object value) {
        if (!(value instanceof List<?> rawList)) {
            return List.of();
        }
        List<Long> ids = new ArrayList<>();
        for (Object item : rawList) {
            Long parsed = parseLong(item);
            if (parsed != null) {
                ids.add(parsed);
            }
        }
        return ids;
    }
}
