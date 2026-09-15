package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.ChatMessage;
import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.ChatMessageRepository;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService implements ApplicationRunner {

    private static final String TYPE_STUDENT = "STUDENT";
    private static final String TYPE_STAFF = "STAFF";
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
    private static final Map<String, String> DEMO_LOGIN_STAFF_IDS = Map.of(
            "superadmin@gmail.com", "9000",
            "admin@gmail.com", "9001",
            "teacher@gmail.com", "9002",
            "accountant@gmail.com", "9005",
            "receptionist@gmail.com", "9006",
            "librarian@gmail.com", "9004"
    );
    private static final Map<String, String> DEMO_DISPLAY_NAMES = Map.of(
            "superadmin@gmail.com", "Super Admin",
            "admin@gmail.com", "Admin User",
            "teacher@gmail.com", "Teacher User",
            "accountant@gmail.com", "Accountant User",
            "receptionist@gmail.com", "Receptionist User",
            "librarian@gmail.com", "Librarian User"
    );

    private final ChatMessageRepository chatMessageRepository;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (chatMessageRepository.count() == 0) {
            seedSampleMessages();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listContacts() {
        String owner = currentUsername();
        Map<String, Map<String, Object>> contacts = new LinkedHashMap<>();

        chatMessageRepository.findByOwnerUsernameOrderBySentAtDesc(owner).forEach(message -> {
            if (isCurrentUserContact(message.getContactType(), message.getContactSourceId())) {
                return;
            }
            String key = contactKey(message.getContactType(), message.getContactSourceId());
            Map<String, Object> contact = contacts.get(key);
            if (contact == null) {
                contact = toThreadContact(message);
                contacts.put(key, contact);
            }
            if (!contact.containsKey("lastMessage") || String.valueOf(contact.get("lastMessage")).isBlank()) {
                contact.put("lastMessage", preview(message.getMessageBody()));
                contact.put("lastMessageAt", message.getSentAt());
            }
        });

        List<Map<String, Object>> rows = new ArrayList<>(contacts.values());
        rows.sort(Comparator
                .comparing((Map<String, Object> row) -> (LocalDateTime) row.get("lastMessageAt"),
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(row -> String.valueOf(row.get("name")), String.CASE_INSENSITIVE_ORDER));
        rows.forEach(row -> row.remove("lastMessageAt"));
        return rows;
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        String owner = authenticatedUsername();
        if (owner == null) {
            return 0;
        }
        return chatMessageRepository.countUnreadIncoming(owner);
    }

    @Transactional
    public List<Map<String, Object>> listMessages(String contactType, Long contactSourceId) {
        String owner = currentUsername();
        chatMessageRepository.markConversationRead(owner, contactType, contactSourceId);
        return chatMessageRepository
                .findByOwnerUsernameAndContactTypeAndContactSourceIdOrderBySentAtAsc(owner, contactType, contactSourceId)
                .stream()
                .map(this::toMessageMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchUsers(String query) {
        String keyword = query == null ? "" : query.trim();
        if (keyword.isBlank()) {
            return List.of();
        }

        String lower = keyword.toLowerCase(Locale.ROOT);
        List<Map<String, Object>> results = new ArrayList<>();

        for (StudentAdmission student : studentAdmissionRepository.search(null, null, keyword, false, null)) {
            if (isCurrentUserContact(TYPE_STUDENT, student.getId())) {
                continue;
            }
            results.add(toSearchResult(new ContactInfo(TYPE_STUDENT, student.getId(),
                    fullName(student.getFirstName(), student.getLastName()), "Student"), student.getPhotoPath()));
        }

        for (StaffMember staff : staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc()) {
            if (isCurrentUserContact(TYPE_STAFF, staff.getId())) {
                continue;
            }
            String name = fullName(staff.getFirstName(), staff.getLastName());
            String email = staff.getEmail() == null ? "" : staff.getEmail();
            if (name.toLowerCase(Locale.ROOT).contains(lower) || email.toLowerCase(Locale.ROOT).contains(lower)) {
                String role = staff.getRoles() == null || staff.getRoles().isBlank()
                        ? "Staff" : staff.getRoles().split(",")[0].trim();
                results.add(toSearchResult(new ContactInfo(TYPE_STAFF, staff.getId(), name, role), staff.getPhotoPath()));
            }
        }

        if (results.isEmpty()) {
            demoContacts().stream()
                    .filter(contact -> contact.getName().toLowerCase(Locale.ROOT).contains(lower))
                    .map(contact -> toSearchResult(contact, null))
                    .forEach(results::add);
        }

        return results;
    }

    private Map<String, Object> toSearchResult(ContactInfo contact, String photoPath) {
        Map<String, Object> map = contact.toMap();
        if (photoPath != null && !photoPath.isBlank()) {
            map.put("avatarUrl", photoPath.startsWith("/") || photoPath.startsWith("http")
                    ? photoPath : "/uploads/" + photoPath.replace("\\", "/"));
            map.put("hasPhoto", true);
        } else {
            map.put("hasPhoto", false);
        }
        return map;
    }

    @Transactional
    public Map<String, Object> sendMessage(Map<String, Object> payload) {
        String owner = currentUsername();
        String contactType = required(payload.get("contactType"), "Contact type is required");
        Long contactSourceId = parseLong(payload.get("contactSourceId"), "Contact id is required");
        String messageBody = required(payload.get("message"), "Message is required");

        if (isCurrentUserContact(contactType, contactSourceId)) {
            throw new IllegalArgumentException("You cannot chat with yourself");
        }

        ContactInfo contact = resolveContact(contactType, contactSourceId)
                .orElseGet(() -> contactFromPayload(payload, contactType, contactSourceId));

        LocalDateTime sentAt = LocalDateTime.now();
        String body = messageBody.trim();
        ChatMessage saved = chatMessageRepository.save(ChatMessage.builder()
                .ownerUsername(owner)
                .contactType(contact.getType())
                .contactSourceId(contact.getSourceId())
                .contactName(contact.getName())
                .contactRole(contact.getRoleLabel())
                .messageBody(body)
                .sentByOwner(true)
                .readByOwner(true)
                .sentAt(sentAt)
                .build());

        deliverIncomingCopy(owner, contact, body, sentAt);
        return toMessageMap(saved);
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        String owner = currentUsername();
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        if (!owner.equalsIgnoreCase(message.getOwnerUsername())) {
            throw new IllegalArgumentException("You cannot delete this message");
        }
        if (!Boolean.TRUE.equals(message.getSentByOwner())) {
            throw new IllegalArgumentException("You can only delete your own messages");
        }
        chatMessageRepository.delete(message);
    }

    private Map<String, Object> toMessageMap(ChatMessage message) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", message.getId());
        row.put("message", message.getMessageBody());
        row.put("sentByOwner", Boolean.TRUE.equals(message.getSentByOwner()));
        row.put("sentAt", message.getSentAt() != null ? message.getSentAt().format(TIME_FMT) : "");
        return row;
    }

    private Map<String, Object> toThreadContact(ChatMessage message) {
        Map<String, Object> contact = new LinkedHashMap<>();
        contact.put("contactType", message.getContactType());
        contact.put("contactSourceId", message.getContactSourceId());
        contact.put("name", message.getContactName());
        contact.put("roleLabel", message.getContactRole());
        contact.put("avatarUrl", avatarUrl(message.getContactName()));
        contact.put("lastMessage", preview(message.getMessageBody()));
        contact.put("lastMessageAt", message.getSentAt());
        resolveContact(message.getContactType(), message.getContactSourceId()).ifPresent(info -> {
            contact.put("name", info.getName());
            contact.put("roleLabel", info.getRoleLabel());
        });
        return contact;
    }

    private boolean isCurrentUserContact(String contactType, Long contactSourceId) {
        if (contactType == null || contactSourceId == null) {
            return false;
        }
        String owner = currentUsername();
        if (TYPE_STAFF.equalsIgnoreCase(contactType)) {
            return staffMemberRepository.findById(contactSourceId)
                    .map(this::loginUsernameForStaff)
                    .filter(owner::equalsIgnoreCase)
                    .isPresent();
        }
        if (TYPE_STUDENT.equalsIgnoreCase(contactType)) {
            return studentAdmissionRepository.findById(contactSourceId)
                    .map(StudentAdmission::getEmail)
                    .filter(email -> email != null && email.equalsIgnoreCase(owner))
                    .isPresent();
        }
        return false;
    }

    private Optional<ContactInfo> resolveContact(String contactType, Long contactSourceId) {
        if (TYPE_STUDENT.equalsIgnoreCase(contactType)) {
            return studentAdmissionRepository.findById(contactSourceId)
                    .map(student -> new ContactInfo(TYPE_STUDENT, student.getId(),
                            fullName(student.getFirstName(), student.getLastName()), "Student"));
        }
        if (TYPE_STAFF.equalsIgnoreCase(contactType)) {
            return staffMemberRepository.findById(contactSourceId)
                    .map(staff -> new ContactInfo(TYPE_STAFF, staff.getId(),
                            fullName(staff.getFirstName(), staff.getLastName()),
                            staff.getRoles() == null || staff.getRoles().isBlank()
                                    ? "Staff" : staff.getRoles().split(",")[0].trim()));
        }
        return Optional.empty();
    }

    private ContactInfo contactFromPayload(Map<String, Object> payload, String contactType, Long contactSourceId) {
        String name = payload.get("contactName") == null ? "User" : String.valueOf(payload.get("contactName")).trim();
        String role = payload.get("contactRole") == null ? "User" : String.valueOf(payload.get("contactRole")).trim();
        if (name.isBlank()) {
            throw new IllegalArgumentException("Contact not found");
        }
        return new ContactInfo(contactType.toUpperCase(Locale.ROOT), contactSourceId, name, role);
    }

    private void seedSampleMessages() {
        String owner = "superadmin@gmail.com";
        LocalDateTime now = LocalDateTime.now();
        Object[][] samples = {
                {TYPE_STUDENT, 1L, "Edward Thomas", "Student", "Hello Sir, the attendance report for Class 1 is ready.", false, now.minusHours(1)},
                {TYPE_STAFF, 1L, "Maria Ford", "Staff", "Please review the updated lesson plan.", false, now.minusHours(2)},
                {TYPE_STUDENT, 2L, "Nishant Khare", "Student", "Can I get a copy of my fee receipt?", false, now.minusHours(3)},
                {TYPE_STUDENT, 3L, "Vinay Singh", "Student", "Thank you for approving my leave request.", false, now.minusHours(4)},
                {TYPE_STAFF, 2L, "Glen Stark", "Teacher", "Exam schedule has been shared with all classes.", false, now.minusHours(5)}
        };

        for (Object[] sample : samples) {
            chatMessageRepository.save(ChatMessage.builder()
                    .ownerUsername(owner)
                    .contactType(String.valueOf(sample[0]))
                    .contactSourceId((Long) sample[1])
                    .contactName(String.valueOf(sample[2]))
                    .contactRole(String.valueOf(sample[3]))
                    .messageBody(String.valueOf(sample[4]))
                    .sentByOwner((Boolean) sample[5])
                    .readByOwner(Boolean.TRUE.equals(sample[5]))
                    .sentAt((LocalDateTime) sample[6])
                    .build());
        }
    }

    private List<ContactInfo> demoContacts() {
        return List.of(
                new ContactInfo(TYPE_STUDENT, 1L, "Edward Thomas", "Student"),
                new ContactInfo(TYPE_STAFF, 1L, "Maria Ford", "Staff"),
                new ContactInfo(TYPE_STUDENT, 2L, "Nishant Khare", "Student"),
                new ContactInfo(TYPE_STUDENT, 3L, "Vinay Singh", "Student"),
                new ContactInfo(TYPE_STAFF, 2L, "Glen Stark", "Teacher"),
                new ContactInfo(TYPE_STUDENT, 4L, "Sophia Lee", "Student"),
                new ContactInfo(TYPE_STAFF, 3L, "James Carter", "Accountant"),
                new ContactInfo(TYPE_STUDENT, 5L, "Olivia Brown", "Student"),
                new ContactInfo(TYPE_STUDENT, 6L, "Daniel Wilson", "Student"),
                new ContactInfo(TYPE_STAFF, 4L, "Emily Davis", "Receptionist"),
                new ContactInfo(TYPE_STUDENT, 7L, "Alexander Kayla", "Student"),
                new ContactInfo(TYPE_STUDENT, 8L, "Kenal Dezzy", "Student"),
                new ContactInfo(TYPE_STUDENT, 9L, "Alex Johnson", "Student"),
                new ContactInfo(TYPE_STUDENT, 10L, "Alhaji Mohamed Kanu", "Student")
        );
    }

    private void deliverIncomingCopy(String senderUsername, ContactInfo recipient, String messageBody, LocalDateTime sentAt) {
        String recipientUsername = resolveRecipientUsername(recipient);
        if (recipientUsername == null || recipientUsername.equalsIgnoreCase(senderUsername)) {
            return;
        }

        ContactInfo senderContact = resolveSenderContact(senderUsername);
        chatMessageRepository.save(ChatMessage.builder()
                .ownerUsername(recipientUsername)
                .contactType(senderContact.getType())
                .contactSourceId(senderContact.getSourceId())
                .contactName(senderContact.getName())
                .contactRole(senderContact.getRoleLabel())
                .messageBody(messageBody)
                .sentByOwner(false)
                .readByOwner(false)
                .sentAt(sentAt)
                .build());
    }

    private String resolveRecipientUsername(ContactInfo contact) {
        if (TYPE_STAFF.equalsIgnoreCase(contact.getType())) {
            return staffMemberRepository.findById(contact.getSourceId())
                    .map(this::loginUsernameForStaff)
                    .orElse(null);
        }
        if (TYPE_STUDENT.equalsIgnoreCase(contact.getType())) {
            return studentAdmissionRepository.findById(contact.getSourceId())
                    .map(StudentAdmission::getEmail)
                    .map(email -> email == null ? "" : email.trim())
                    .filter(email -> !email.isBlank())
                    .orElse(null);
        }
        return null;
    }

    private String loginUsernameForStaff(StaffMember staff) {
        if (staff.getStaffId() != null) {
            for (Map.Entry<String, String> entry : DEMO_LOGIN_STAFF_IDS.entrySet()) {
                if (entry.getValue().equalsIgnoreCase(staff.getStaffId())) {
                    return entry.getKey();
                }
            }
        }
        if (staff.getEmail() != null && !staff.getEmail().isBlank()) {
            return staff.getEmail().trim();
        }
        return null;
    }

    private ContactInfo resolveSenderContact(String senderUsername) {
        Optional<StaffMember> staff = staffMemberRepository.findByEmailIgnoreCase(senderUsername);
        if (staff.isEmpty()) {
            String demoStaffId = DEMO_LOGIN_STAFF_IDS.get(senderUsername.toLowerCase(Locale.ROOT));
            if (demoStaffId != null) {
                staff = staffMemberRepository.findByStaffId(demoStaffId);
            }
        }
        if (staff.isPresent()) {
            StaffMember member = staff.get();
            String role = member.getRoles() == null || member.getRoles().isBlank()
                    ? "Staff" : member.getRoles().split(",")[0].trim();
            return new ContactInfo(TYPE_STAFF, member.getId(),
                    fullName(member.getFirstName(), member.getLastName()), role);
        }

        return studentAdmissionRepository.findByEmailIgnoreCase(senderUsername).stream()
                .findFirst()
                .map(student -> new ContactInfo(TYPE_STUDENT, student.getId(),
                        fullName(student.getFirstName(), student.getLastName()), "Student"))
                .orElseGet(() -> new ContactInfo(TYPE_STAFF, 0L,
                        DEMO_DISPLAY_NAMES.getOrDefault(senderUsername.toLowerCase(Locale.ROOT), senderUsername),
                        "Staff"));
    }

    private String authenticatedUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String name = authentication.getName();
        if (name == null || name.isBlank() || "anonymousUser".equalsIgnoreCase(name)) {
            return null;
        }
        return name;
    }

    private String currentUsername() {
        String username = authenticatedUsername();
        return username != null ? username : "superadmin@gmail.com";
    }

    private String contactKey(String type, Long id) {
        return type.toUpperCase(Locale.ROOT) + ":" + id;
    }

    private String preview(String message) {
        if (message == null || message.isBlank()) {
            return "";
        }
        return message.length() > 42 ? message.substring(0, 42) + "..." : message;
    }

    private String avatarUrl(String name) {
        return "https://ui-avatars.com/api/?name="
                + java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8)
                + "&background=e2e8f0&color=4a5568&size=80";
    }

    private String fullName(String firstName, String lastName) {
        return ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
    }

    private String required(Object value, String message) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return String.valueOf(value).trim();
    }

    private Long parseLong(Object value, String message) {
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(message);
        }
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(message);
        }
    }

    private static class ContactInfo {
        private final String type;
        private final Long sourceId;
        private final String name;
        private final String roleLabel;

        private ContactInfo(String type, Long sourceId, String name, String roleLabel) {
            this.type = type;
            this.sourceId = sourceId;
            this.name = name;
            this.roleLabel = roleLabel;
        }

        private String getType() {
            return type;
        }

        private Long getSourceId() {
            return sourceId;
        }

        private String getName() {
            return name;
        }

        private String getRoleLabel() {
            return roleLabel;
        }

        private Map<String, Object> toMap() {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("contactType", type);
            map.put("contactSourceId", sourceId);
            map.put("name", name);
            map.put("roleLabel", roleLabel);
            map.put("avatarUrl", "https://ui-avatars.com/api/?name="
                    + java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8)
                    + "&background=e2e8f0&color=4a5568&size=80");
            map.put("lastMessage", "");
            return map;
        }
    }
}
