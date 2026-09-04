package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppUserAccount;
import com.kantechsolution.smart_school.model.NotificationSetting;
import com.kantechsolution.smart_school.model.StudentAdmission;
import com.kantechsolution.smart_school.repository.NotificationSettingRepository;
import com.kantechsolution.smart_school.repository.StudentAdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoginCredentialDeliveryService {

    private final StudentAdmissionRepository studentAdmissionRepository;
    private final UserLoginAuthService userLoginAuthService;
    private final NotificationSettingRepository notificationSettingRepository;
    private final NotificationTemplateService notificationTemplateService;
    private final SchoolGeneralSettingService schoolGeneralSettingService;
    private final SystemMailService systemMailService;
    private final SystemSmsService systemSmsService;
    private final SystemPushService systemPushService;

    @Transactional
    public CommunicateDeliveryResult sendLoginCredentials(List<Long> studentIds,
                                                          String messageTo,
                                                          String notificationType) {
        CommunicateDeliveryResult result = new CommunicateDeliveryResult();
        if (studentIds == null || studentIds.isEmpty()) {
            result.recordFailure("No students were selected.");
            return result;
        }

        List<String> eventKeys = resolveEventKeys(notificationType);
        boolean sendStudent = messageTo == null || messageTo.isBlank()
                || "Student".equalsIgnoreCase(messageTo)
                || "Both".equalsIgnoreCase(messageTo);
        boolean sendGuardian = "Guardian".equalsIgnoreCase(messageTo) || "Both".equalsIgnoreCase(messageTo);

        for (Long studentId : studentIds) {
            StudentAdmission student = studentAdmissionRepository.findById(studentId).orElse(null);
            if (student == null) {
                result.recordFailure("Student not found: " + studentId);
                continue;
            }

            if (sendStudent) {
                mergeResult(result, deliverForAccount(
                        userLoginAuthService.ensureStudentAccount(student),
                        student,
                        eventKeys,
                        false));
            }
            if (sendGuardian) {
                mergeResult(result, deliverForAccount(
                        userLoginAuthService.ensureParentAccount(student),
                        student,
                        eventKeys,
                        true));
            }
        }

        return result;
    }

    private CommunicateDeliveryResult deliverForAccount(AppUserAccount account,
                                                        StudentAdmission student,
                                                        List<String> eventKeys,
                                                        boolean guardian) {
        CommunicateDeliveryResult result = new CommunicateDeliveryResult();
        Map<String, String> variables = buildVariables(account, student, guardian);

        for (String eventKey : eventKeys) {
            NotificationSetting setting = notificationSettingRepository.findByEventKey(eventKey).orElse(null);
            if (setting == null) {
                result.recordFailure("Notification setting not found: " + eventKey);
                continue;
            }

            String subject = notificationTemplateService.render(
                    setting.getMessageSubject() == null || setting.getMessageSubject().isBlank()
                            ? "Login credentials - {{school_name}}"
                            : setting.getMessageSubject(),
                    variables);
            String body = notificationTemplateService.render(setting.getSampleMessage(), variables);
            if (body.isBlank()) {
                result.recordFailure("Notification template is empty for " + eventKey);
                continue;
            }

            if (Boolean.TRUE.equals(setting.getNotifyEmail())) {
                String email = guardian ? firstNonBlank(student.getGuardianEmail(), student.getEmail())
                        : student.getEmail();
                if (email == null || email.isBlank()) {
                    result.recordFailure((guardian ? "Guardian" : "Student") + " email missing for " + student.getAdmissionNo());
                } else {
                    CommunicateDeliveryResult emailResult = systemMailService.sendToMany(
                            List.of(email), subject, body.replace("\n", "<br>"), null);
                    mergeResult(result, emailResult);
                }
            }

            if (Boolean.TRUE.equals(setting.getNotifySms())) {
                String phone = guardian
                        ? firstNonBlank(student.getGuardianPhone(), student.getFatherPhone(), student.getMotherPhone())
                        : student.getMobileNumber();
                if (phone == null || phone.isBlank()) {
                    result.recordFailure((guardian ? "Guardian" : "Student") + " mobile missing for " + student.getAdmissionNo());
                } else {
                    mergeResult(result, systemSmsService.sendToMany(List.of(phone), body));
                }
            }

            if (Boolean.TRUE.equals(setting.getNotifyMobileApp())) {
                mergeResult(result, systemPushService.sendToMany(
                        List.of(new CommunicateRecipientResolver.PushTarget(account.getUserType(), account.getSourceId())),
                        subject,
                        body));
            }
        }

        return result;
    }

    private List<String> resolveEventKeys(String notificationType) {
        if (notificationType == null || notificationType.isBlank()) {
            return List.of("student_login_credential");
        }
        return switch (notificationType.trim()) {
            case "Student Admission" -> List.of("student_admission");
            case "Both" -> List.of("student_admission", "student_login_credential");
            default -> List.of("student_login_credential");
        };
    }

    private Map<String, String> buildVariables(AppUserAccount account, StudentAdmission student, boolean guardian) {
        Map<String, String> variables = new LinkedHashMap<>();
        String schoolName = "";
        String baseUrl = "/site/login";
        try {
            Map<String, Object> settings = schoolGeneralSettingService.getSettings();
            schoolName = text(settings.get("schoolName"));
            String configuredBaseUrl = text(settings.get("baseUrl"));
            if (!configuredBaseUrl.isBlank()) {
                baseUrl = configuredBaseUrl.replaceAll("/+$", "") + "/site/login";
            }
        } catch (Exception ignored) {
            // use defaults
        }

        String displayName = fullStudentName(student);
        variables.put("school_name", schoolName);
        variables.put("url", baseUrl);
        variables.put("username", account.getUsername());
        variables.put("password", userLoginAuthService.resolvePlainPassword(account));
        variables.put("admission_no", text(student.getAdmissionNo()));
        variables.put("display_name", guardian ? firstNonBlank(student.getGuardianName(), displayName) : displayName);
        variables.put("student_name", displayName);
        variables.put("class", student.getSchoolClass() != null ? text(student.getSchoolClass().getName()) : "");
        variables.put("section", text(student.getSection()));
        variables.put("email", guardian ? firstNonBlank(student.getGuardianEmail(), student.getEmail()) : text(student.getEmail()));
        variables.put("contact_no", guardian
                ? firstNonBlank(student.getGuardianPhone(), student.getFatherPhone(), student.getMotherPhone())
                : text(student.getMobileNumber()));
        variables.put("guardian_name", text(student.getGuardianName()));
        variables.put("roll_no", text(student.getRollNumber()));
        variables.put("admission_date", student.getAdmissionDate() != null ? student.getAdmissionDate().toString() : "");
        variables.put("mobileno", text(student.getMobileNumber()));
        variables.put("dob", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "");
        variables.put("gender", text(student.getGender()));
        variables.put("father_name", text(student.getFatherName()));
        variables.put("mother_name", text(student.getMotherName()));
        variables.put("blood_group", text(student.getBloodGroup()));
        return variables;
    }

    private void mergeResult(CommunicateDeliveryResult target, CommunicateDeliveryResult source) {
        for (int i = 0; i < source.getSentCount(); i++) {
            target.recordSuccess();
        }
        for (String error : source.getErrors()) {
            target.recordFailure(error);
        }
    }

    private String fullStudentName(StudentAdmission student) {
        String first = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String last = student.getLastName() == null ? "" : student.getLastName().trim();
        return (first + " " + last).trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
