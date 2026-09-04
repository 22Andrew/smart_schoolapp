package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.StaffMember;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.StaffMemberRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CommunicateRecipientResolver {

    public record PushTarget(String userType, Long sourceId) {
    }

    private static final Map<String, List<String>> DEMO_ROLE_EMAILS = Map.of(
            "Admin", List.of("superadmin@gmail.com", "admin@gmail.com"),
            "Teacher", List.of("teacher@gmail.com"),
            "Accountant", List.of("accountant@gmail.com"),
            "Librarian", List.of("librarian@gmail.com"),
            "Receptionist", List.of("receptionist@gmail.com")
    );

    private final JsonMapper jsonMapper;
    private final StudentAdmissionRepository studentAdmissionRepository;
    private final StaffMemberRepository staffMemberRepository;

    @Transactional(readOnly = true)
    public Set<String> resolveEmails(String recipientType, String recipientDetailsJson) {
        Set<String> emails = new LinkedHashSet<>();
        resolve(recipientType, recipientDetailsJson, emails, new LinkedHashSet<>(), new LinkedHashSet<>(), Channel.EMAIL);
        return emails;
    }

    @Transactional(readOnly = true)
    public Set<String> resolvePhones(String recipientType, String recipientDetailsJson) {
        Set<String> phones = new LinkedHashSet<>();
        resolve(recipientType, recipientDetailsJson, new LinkedHashSet<>(), phones, new LinkedHashSet<>(), Channel.SMS);
        return phones;
    }

    @Transactional(readOnly = true)
    public Set<PushTarget> resolvePushTargets(String recipientType, String recipientDetailsJson) {
        Set<PushTarget> targets = new LinkedHashSet<>();
        resolve(recipientType, recipientDetailsJson, new LinkedHashSet<>(), new LinkedHashSet<>(), targets, Channel.PUSH);
        return targets;
    }

    private void resolve(String recipientType,
                         String recipientDetailsJson,
                         Set<String> emails,
                         Set<String> phones,
                         Set<PushTarget> pushTargets,
                         Channel channel) {
        if (recipientType == null || recipientType.isBlank()) {
            return;
        }

        Map<String, Object> details = parseDetails(recipientDetailsJson);
        switch (recipientType.trim()) {
            case "Group" -> resolveGroup(details, emails, phones, pushTargets, channel);
            case "Individual" -> resolveIndividual(details, emails, phones, pushTargets, channel);
            case "Class" -> resolveClass(details, emails, phones, pushTargets, channel);
            case "Birthday" -> resolveBirthday(details, emails, phones, pushTargets, channel);
            default -> {
                // Legacy/simple logs may store plain text only.
            }
        }
    }

    private void resolveGroup(Map<String, Object> details,
                              Set<String> emails,
                              Set<String> phones,
                              Set<PushTarget> pushTargets,
                              Channel channel) {
        List<String> roles = readStringList(details.get("roles"));
        for (String role : roles) {
            switch (role) {
                case "Students" -> activeStudents().forEach(student -> addStudentContacts(student, "Students", emails, phones, pushTargets, channel));
                case "Guardians" -> activeStudents().forEach(student -> addStudentContacts(student, "Guardians", emails, phones, pushTargets, channel));
                case "Students-Guardians" -> activeStudents().forEach(student -> addStudentContacts(student, "Students-Guardians", emails, phones, pushTargets, channel));
                default -> {
                    addDemoRoleContacts(role, emails, phones, pushTargets, channel);
                    staffMemberRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc().stream()
                            .filter(staff -> roleMatches(staff, role))
                            .forEach(staff -> addStaffContacts(staff, emails, phones, pushTargets, channel));
                }
            }
        }
    }

    private void resolveIndividual(Map<String, Object> details,
                                   Set<String> emails,
                                   Set<String> phones,
                                   Set<PushTarget> pushTargets,
                                   Channel channel) {
        Object rawRecipients = details.get("recipients");
        if (!(rawRecipients instanceof List<?> list)) {
            return;
        }

        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) {
                continue;
            }
            String type = text(map.get("type"));
            Long sourceId = parseLong(map.get("sourceId"));
            String id = text(map.get("id"));

            if (sourceId != null && (type.contains("Student") || type.contains("Guardian") || id.startsWith("student-"))) {
                studentAdmissionRepository.findById(sourceId).ifPresent(student -> addStudentContacts(student, type, emails, phones, pushTargets, channel));
                continue;
            }

            if (sourceId != null && id.startsWith("staff-")) {
                staffMemberRepository.findById(sourceId).ifPresent(staff -> addStaffContacts(staff, emails, phones, pushTargets, channel));
                continue;
            }

            if (type.equals("Admin") || type.equals("Teacher") || type.equals("Accountant")
                    || type.equals("Librarian") || type.equals("Receptionist")) {
                addDemoRoleContacts(type, emails, phones, pushTargets, channel);
                staffMemberRepository.search(type, null).forEach(staff -> addStaffContacts(staff, emails, phones, pushTargets, channel));
            }
        }
    }

    private void resolveClass(Map<String, Object> details,
                              Set<String> emails,
                              Set<String> phones,
                              Set<PushTarget> pushTargets,
                              Channel channel) {
        Long classId = parseLong(details.get("classId"));
        if (classId == null) {
            return;
        }

        Object rawSections = details.get("sections");
        if (!(rawSections instanceof List<?> sections)) {
            return;
        }

        for (Object sectionItem : sections) {
            if (!(sectionItem instanceof Map<?, ?> sectionMap)) {
                continue;
            }
            String section = text(sectionMap.get("section"));
            String audience = text(sectionMap.get("sendTo"));
            if (audience.isBlank()) {
                audience = "Students";
            }
            final String sendTo = audience;

            activeStudents().stream()
                    .filter(student -> student.getSchoolClass() != null && classId.equals(student.getSchoolClass().getId()))
                    .filter(student -> section.isBlank() || section.equalsIgnoreCase(text(student.getSection())))
                    .forEach(student -> addStudentContacts(student, sendTo, emails, phones, pushTargets, channel));
        }
    }

    private void resolveBirthday(Map<String, Object> details,
                                 Set<String> emails,
                                 Set<String> phones,
                                 Set<PushTarget> pushTargets,
                                 Channel channel) {
        Object rawStudents = details.get("students");
        if (!(rawStudents instanceof List<?> students)) {
            return;
        }

        for (Object item : students) {
            if (item instanceof Map<?, ?> map) {
                Long id = parseLong(map.get("id"));
                if (id != null) {
                    studentAdmissionRepository.findById(id)
                            .ifPresent(student -> addStudentContacts(student, "Students-Guardians", emails, phones, pushTargets, channel));
                    continue;
                }
                addTextContact(text(map.get("email")), text(map.get("mobileNumber")), emails, phones, channel);
            }
        }
    }

    private List<StudentAdmission> activeStudents() {
        return studentAdmissionRepository.findByDisabledFalseOrderByFirstNameAscLastNameAsc();
    }

    private void addStudentContacts(StudentAdmission student,
                                    String audience,
                                    Set<String> emails,
                                    Set<String> phones,
                                    Set<PushTarget> pushTargets,
                                    Channel channel) {
        String normalized = audience == null ? "Students" : audience.trim();
        if (normalized.contains("Student")) {
            addTextContact(student.getEmail(), student.getMobileNumber(), emails, phones, channel);
            if (channel.includesPush()) {
                pushTargets.add(new PushTarget(UserLoginAuthService.TYPE_STUDENT, student.getId()));
            }
        }
        if (normalized.contains("Guardian")) {
            String guardianPhone = firstNonBlank(student.getGuardianPhone(), student.getFatherPhone(), student.getMotherPhone());
            addTextContact(student.getGuardianEmail(), guardianPhone, emails, phones, channel);
            if (channel.includesPush()) {
                pushTargets.add(new PushTarget(UserLoginAuthService.TYPE_PARENT, student.getId()));
            }
        }
    }

    private void addStaffContacts(StaffMember staff,
                                  Set<String> emails,
                                  Set<String> phones,
                                  Set<PushTarget> pushTargets,
                                  Channel channel) {
        addTextContact(staff.getEmail(), staff.getPhone(), emails, phones, channel);
        if (channel.includesPush()) {
            pushTargets.add(new PushTarget("STAFF", staff.getId()));
        }
    }

    private void addDemoRoleContacts(String role,
                                     Set<String> emails,
                                     Set<String> phones,
                                     Set<PushTarget> pushTargets,
                                     Channel channel) {
        List<String> demoEmails = DEMO_ROLE_EMAILS.getOrDefault(role, List.of());
        for (String email : demoEmails) {
            if (channel.includesEmail()) {
                addEmail(emails, email);
            }
            staffMemberRepository.findByEmailIgnoreCase(email)
                    .ifPresent(staff -> addStaffContacts(staff, emails, phones, pushTargets, channel));
        }
    }

    private void addTextContact(String email, String phone, Set<String> emails, Set<String> phones, Channel channel) {
        if (channel.includesEmail()) {
            addEmail(emails, email);
        }
        if (channel.includesSms()) {
            addPhone(phones, phone);
        }
    }

    private void addEmail(Set<String> emails, String email) {
        String normalized = normalizeEmail(email);
        if (!normalized.isBlank()) {
            emails.add(normalized);
        }
    }

    private void addPhone(Set<String> phones, String phone) {
        String normalized = normalizePhone(phone);
        if (!normalized.isBlank()) {
            phones.add(normalized);
        }
    }

    private boolean roleMatches(StaffMember staff, String role) {
        if (role == null || role.isBlank()) {
            return false;
        }
        String roles = staff.getRoles() == null ? "" : staff.getRoles().toLowerCase(Locale.ROOT);
        return roles.contains(role.trim().toLowerCase(Locale.ROOT));
    }

    private Map<String, Object> parseDetails(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        String trimmed = json.trim();
        if (!trimmed.startsWith("{")) {
            return Map.of();
        }
        try {
            return jsonMapper.readValue(trimmed, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception error) {
            return Map.of();
        }
    }

    private List<String> readStringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<String> items = new ArrayList<>();
        for (Object item : list) {
            String text = text(item);
            if (!text.isBlank()) {
                items.add(text);
            }
        }
        return items;
    }

    private Long parseLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(value.toString().trim());
        } catch (NumberFormatException error) {
            return null;
        }
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return "";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return "";
        }
        String digits = phone.replaceAll("[^0-9+]", "");
        return digits.length() >= 7 ? digits : "";
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private enum Channel {
        EMAIL,
        SMS,
        PUSH,
        BOTH;

        boolean includesEmail() {
            return this == EMAIL || this == BOTH;
        }

        boolean includesSms() {
            return this == SMS || this == BOTH;
        }

        boolean includesPush() {
            return this == PUSH;
        }
    }
}
