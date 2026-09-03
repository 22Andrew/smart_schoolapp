package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.NotificationSetting;
import com.kantechsolution.smart_school.repository.NotificationSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationSettingService implements ApplicationRunner {

    private final NotificationSettingRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        syncCanonicalEvents();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllSettings() {
        return repository.findAllByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public List<Map<String, Object>> saveAllSettings(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            throw new IllegalArgumentException("No notification settings provided");
        }

        Set<String> canonicalKeys = canonicalEventKeys();

        for (Map<String, Object> row : rows) {
            Long id = longValue(row.get("id"));
            if (id == null) {
                continue;
            }
            NotificationSetting setting = repository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Notification setting not found"));

            if (!canonicalKeys.contains(setting.getEventKey())) {
                continue;
            }

            setting.setNotifyEmail(boolValue(row.get("notifyEmail"), false));
            setting.setNotifySms(boolValue(row.get("notifySms"), false));
            setting.setNotifyMobileApp(boolValue(row.get("notifyMobileApp"), false));
            setting.setNotifyWhatsapp(boolValue(row.get("notifyWhatsapp"), false));
            setting.setRecipientStudent(boolValue(row.get("recipientStudent"), false));
            setting.setRecipientGuardian(boolValue(row.get("recipientGuardian"), false));
            setting.setRecipientStaff(boolValue(row.get("recipientStaff"), false));
            setting.setMessageSubject(text(row.get("messageSubject")));
            setting.setSmsTemplateId(text(row.get("smsTemplateId")));
            setting.setWhatsappTemplateId(text(row.get("whatsappTemplateId")));
            setting.setSampleMessage(text(row.get("sampleMessage")));
            repository.save(setting);
        }

        return getAllSettings();
    }

    private void syncCanonicalEvents() {
        Set<String> canonicalKeys = canonicalEventKeys();
        int order = 1;

        for (SeedEvent seed : defaultEvents()) {
            Optional<NotificationSetting> existing = repository.findByEventKey(seed.eventKey());
            NotificationSetting setting = existing.orElseGet(() -> NotificationSetting.builder()
                    .eventKey(seed.eventKey())
                    .notifyEmail(seed.notifyEmail())
                    .notifySms(seed.notifySms())
                    .notifyMobileApp(seed.notifyMobileApp())
                    .notifyWhatsapp(seed.notifyWhatsapp())
                    .recipientStudent(seed.recipientStudent())
                    .recipientGuardian(seed.recipientGuardian())
                    .recipientStaff(seed.recipientStaff())
                    .smsTemplateId(seed.smsTemplateId())
                    .whatsappTemplateId(seed.whatsappTemplateId())
                    .sampleMessage(seed.sampleMessage())
                    .build());

            setting.setEventName(seed.eventName());
            setting.setSortOrder(order++);
            setting.setIsActive(true);
            repository.save(setting);
        }

        repository.findAll().forEach(setting -> {
            if (!canonicalKeys.contains(setting.getEventKey())) {
                setting.setIsActive(false);
                repository.save(setting);
            }
        });
    }

    private Set<String> canonicalEventKeys() {
        Set<String> keys = new LinkedHashSet<>();
        defaultEvents().forEach(seed -> keys.add(seed.eventKey()));
        return keys;
    }

    private List<SeedEvent> defaultEvents() {
        return List.of(
                event("online_admission_fees_submission", "Online Admission Fees Submission", true, false, false, true,
                        true, true, false, "", "15337e72b2259648a4d4c5c285e6ef97",
                        "Dear student, your online admission fee is successfully submitted. Transaction ID: {transaction_id} Amount: {amount}. Thanks for your interest in our school."),
                event("behaviour_incident_assigned", "Behaviour Incident Assigned", true, false, false, false,
                        true, true, false, "", "HXd7195c2d239676124c4e08f58232f04a",
                        "A new {{incident_title}} behaviour incident with {{incident_point}} point is assigned on you. {{student_name}} {{class}} {{section}} {{admission_no}} {{mobileno}} {{email}} {{guardian_name}} {{guardian_phone}} {{guardian_email}}"),
                event("cbse_exam_result", "CBSE Exam Result", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear {{student_name}}-{{roll_no}}, your {{exam}} result has been published."),
                event("cbse_exam_marksheet_pdf", "CBSE Exam Markseet Pdf", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{student_name}} ({{admission_no}}) {{class}} Section {{section}}. We have mailed you the marksheet with Roll no.{{roll_no}}"),
                event("online_course_guest_user_sign_up", "Online Course Guest User Sign Up", true, false, false, false,
                        true, false, false, "", "",
                        "Dear {{guest_user_name}} you have successfully sign up with Email: {{email}} Url {{url}}"),
                event("online_course_purchase_for_guest_user", "Online Course Purchase For Guest User", true, false, false, false,
                        true, false, false, "", "",
                        "Thanks for purchasing course {{title}} discount {{discount}} amount {{price}} purchase date {{purchase_date}}"),
                event("email_pdf_exam_marksheet", "Email PDF Exam Marksheet", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{student_name}} ({{admission_no}}) {{class}} Section {{section}}. We have mailed you the marksheet of Exam {{exam}} Roll no.{{roll_no}}"),
                event("student_apply_leave", "Student Apply Leave", true, false, false, false,
                        false, true, true, "", "",
                        "My Name is {{student_name}} Class {{class}} section {{section}}. I have to apply leave on {{apply_date}}and from {{from_date}} to {{to_date}}. {{message}} please provide."),
                event("online_admission_fees_processing", "Online Admission Fees Processing", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{firstname}} {{lastname}} your online admission form is Submitted successfully and the payment of {{paid_amount}} has processing on date {{date}}. Your Reference number is {{reference_no}} and your transaction id {{transaction_id}}. Please remember your reference number for further process."),
                event("fee_processing", "Fee Processing", true, false, false, false,
                        true, true, false, "", "",
                        "Dear parents, we have received Fees Amount {{fee_amount}} for {{student_name}} by Your School Name {{class}} {{section}} {{email}} {{contact_no}} {{student_name}} {{class}} {{section}} {{email}} {{contact_no}} transaction_id :{{transaction_id}} {{fee_amount}}"),
                event("staff_login_credential", "Staff Login Credential", true, false, false, false,
                        false, false, true, "", "",
                        "Hello {{first_name}} {{last_name}} your login details for Url: {{url}} Username: {{username}} Password: {{password}} Employee ID: {{employee_id}}"),
                event("student_login_credential", "Student Login Credential", true, false, false, false,
                        true, true, false, "", "",
                        "Hello {{display_name}} your login details for Url: {{url}} Username: {{username}} Password: {{password}} admission No: {{admission_no}}"),
                event("online_course_purchase", "Online Course Purchase", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Thanks for purchasing course {{title}} amount {{price}} purchase date {{purchase_date}} class {{class}} section {{section}} and assign for {assign_teacher}}"),
                event("online_course_publish", "Online Course Publish", true, false, false, false,
                        true, true, false, "", "HXd7195c2d239676124c4e08f58232f04a",
                        "Dear student, a new online course {{title}} and price {{price}} with discount {{discount}} for {{class}} {{section}} is {{paid_free}} now available and assign to {{assign_teacher}}."),
                event("student_admission", "Student Admission", true, false, false, false,
                        true, true, false, "", "HX79a8092a2814053d9147bf76de5a6f3b",
                        "Dear {{student_name}} your admission is confirm in Class: {{class}} Section: {{section}} for Session: {{current_session_name}} for more detail contact System Admin {{class}} {{section}} {{admission_no}} {{roll_no}} {{admission_date}} {{mobileno}} {{email}} {{dob}} {{guardian_name}} {{guardian_relation}} {{guardian_phone}} {{father_name}} {{father_phone}} {{blood_group}} {{mother_name}} {{gender}} {{guardian_email}}"),
                event("online_admission_form_submission", "Online Admission Form Submission", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{firstname}} {{lastname}} your online admission form has been submitted successfully on date {{date}}. Your Reference number is {{reference_no}}. Please remember your reference number for further process."),
                event("forgot_password", "Forgot Password", true, false, false, false,
                        true, true, true, "", "",
                        "Dear {{name}}, Recently a request was submitted to reset password for your account. If you didn't make the request, just ignore this email. Otherwise you can reset your password using this link Click here to reset your password, if you're having trouble clicking the password reset button, copy and paste the URL below into your web browser. your username {{username}} {{resetPassLink}} Regards, {{school_name}}"),
                event("exam_result", "Exam Result", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{student_name}} - {{exam_roll_no}}, your {{exam}} result has been published. {{exam_marksheet_url}}"),
                event("fee_submission", "Fee Submission", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear parents, we have received Fees Amount {{fee_amount}} for {{student_name}} by Your School Name {{class}} {{section}} {{fine_type}} {{fine_percentage}} {{fine_amount}} {{fee_group_name}} {{type}} {{code}} {{email}} {{contact_no}} {{invoice_id}} {{sub_invoice_id}} {{due_date}} {{amount}} {{fee_amount}} {{fee_receipt_url}}"),
                event("student_absent_attendance", "Student Absent Attendance", true, false, false, false,
                        true, true, false, "", "",
                        "Absent Notice :{{student_name}} was absent on date {{date}} in period {{subject_name}} {{subject_code}} {{subject_type}} from Your School Name"),
                event("homework", "Homework", true, false, false, false,
                        true, true, false, "", "",
                        "New Homework has been created for {{student_name}} at {{homework_date}} for the class {{class}} {{section}} {{subject}}. kindly submit your homework before {{submit_date}} .Thank you"),
                event("fee_reminder", "Fees Reminder", true, false, false, false,
                        true, true, false, "", "",
                        "Dear parents, please pay fee amount Rs.{{due_amount}} of {{fee_type}} before {{due_date}} for {{student_name}} from smart school (ignore if you already paid)"),
                event("online_admission_start", "Online Admission Start", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{guardian_name}}, online admission for {{student_name}} has started. Application No: {{application_no}}. - {{school_name}}"),
                event("zoom_live_meetings_start", "Zoom Live Meetings Start", false, false, false, false,
                        false, false, true, "", "",
                        "Dear {{name}}, your live meeting {{title}} has been started for the duration of {{duration}} minute."),
                event("online_examination_publish_exam", "Online Examination Publish Exam", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{student_name}} ({{admission_no}}), online exam {{exam_title}} has been published for {{class}} {{section}} {{subject}}. Exam from {{exam_from}} to {{exam_to}}."),
                event("online_examination_publish_result", "Online Examination Publish Result", true, false, false, false,
                        true, true, false, "", "",
                        "Dear {{student_name}} ({{admission_no}}), online exam {{exam_title}} result has been published."),
                event("zoom_live_classes", "Zoom Live Classes", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear student, your live class {{title}} has been scheduled on {{date}} for the duration of {{duration}} minute, please do not share the link to any body."),
                event("zoom_live_meetings", "Zoom Live Meetings", true, false, false, false,
                        false, false, true, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear staff, your live meeting {{title}} has been scheduled on {{date}} for the duration of {{duration}} minute, please do not share the link to any body."),
                event("gmeet_live_meeting", "Gmeet Live Meeting", true, false, false, false,
                        false, false, true, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear staff, your live meeting {{title}} has been scheduled on {{date}} for the duration of {{duration}} minute, please do not share the link to any body."),
                event("gmeet_live_classes", "Gmeet Live Classes", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear student, your live class {{title}} has been scheduled on {{date}} for the duration of {{duration}} minute, please do not share the link to any body."),
                event("gmeet_live_meeting_start", "Gmeet Live Meeting Start", true, false, false, false,
                        false, false, true, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear {{name}}, your live meeting {{title}} has been started for the duration of {{duration}} minute."),
                event("gmeet_live_classes_start", "Gmeet Live Classes Start", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear student, your live class {{title}} has been started for the duration of {{duration}} minute."),
                event("zoom_live_classes_start", "Zoom Live Classes Start", true, false, false, false,
                        true, true, false, "", "HX6feef977fb43981e9e9a6ada5cb9a54f",
                        "Dear student, your live class {{title}} has been started for the duration of {{duration}} minute."),
                event("student_present_attendance", "Student Present Attendance", true, false, false, false,
                        true, true, false, "", "",
                        "Present Notice :{{student_name}} {{admission_no}} was present on date {{date}} in in_time {{in_time}} period subject-{{subject_name}} subject_code - {{subject_code}} subject_type-{{subject_type}} period_time_from-{{period_time_from}} period_time_to-{{period_time_to}} from Your School Name or more detail contact System Admin mobile no - {{mobileno}} email -{{email}} father name - {{father_name}} father phone -{{father_phone}} father occupation -{{father_occupation}} mother name - {{mother_name}} mother phone -{{mother_phone}} guardian name -{{guardian_name}} guardian phone - {{guardian_phone}} guardian occupation -{{guardian_occupation}} guardian email - {{guardian_email}}"),
                event("homework_evaluation", "Homework Evaluation", true, false, false, false,
                        true, true, false, "", "HXd7195c2d239676124c4e08f58232f04a",
                        "Homework Evaluation Homework Assign Date: {{homework_date}} Last Submit Date: {{submit_date}} Student Name: {{student_name}} . Admission No {{admission_no}} {{class}} section: {{section}} subject : {{subject}} Marks: {{marks}}/{{max_marks}} Date: {{evaluation_date}} Thank you"),
                event("staff_present_attendance", "Staff Present Attendance", true, false, false, false,
                        false, false, true, "", "HXd7195c2d239676124c4e08f58232f04a",
                        "Present Notice: Staff Name {{staff_name}} ({{employee_id}}) is Present on Date : {{date}} at Time : {{in_time}} staff contact no:{{contact_no}} staff mail id : {{email}}"),
                event("staff_absent_attendance", "Staff Absent Attendance", true, false, false, false,
                        false, false, true, "", "HXd7195c2d239676124c4e08f58232f04a",
                        "Absent Notice: Staff Name {{staff_name}} ({{employee_id}}) is Absent on Date : {{date}} staff contact no:{{contact_no}} staff mail id : {{email}}")
        );
    }

    private SeedEvent event(
            String key,
            String name,
            boolean email,
            boolean sms,
            boolean mobileApp,
            boolean whatsapp,
            boolean student,
            boolean guardian,
            boolean staff,
            String smsTemplateId,
            String whatsappTemplateId,
            String sampleMessage) {
        return new SeedEvent(key, name, email, sms, mobileApp, whatsapp, student, guardian, staff,
                smsTemplateId, whatsappTemplateId, sampleMessage);
    }

    private Map<String, Object> toMap(NotificationSetting setting) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", setting.getId());
        map.put("eventKey", setting.getEventKey());
        map.put("eventName", setting.getEventName());
        map.put("sortOrder", setting.getSortOrder());
        map.put("notifyEmail", setting.getNotifyEmail());
        map.put("notifySms", setting.getNotifySms());
        map.put("notifyMobileApp", setting.getNotifyMobileApp());
        map.put("notifyWhatsapp", setting.getNotifyWhatsapp());
        map.put("recipientStudent", setting.getRecipientStudent());
        map.put("recipientGuardian", setting.getRecipientGuardian());
        map.put("recipientStaff", setting.getRecipientStaff());
        map.put("messageSubject", blank(setting.getMessageSubject()));
        map.put("smsTemplateId", blank(setting.getSmsTemplateId()));
        map.put("whatsappTemplateId", blank(setting.getWhatsappTemplateId()));
        map.put("sampleMessage", blank(setting.getSampleMessage()));
        return map;
    }

    private Long longValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean boolValue(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String blank(String value) {
        return value == null ? "" : value;
    }

    private record SeedEvent(
            String eventKey,
            String eventName,
            boolean notifyEmail,
            boolean notifySms,
            boolean notifyMobileApp,
            boolean notifyWhatsapp,
            boolean recipientStudent,
            boolean recipientGuardian,
            boolean recipientStaff,
            String smsTemplateId,
            String whatsappTemplateId,
            String sampleMessage) {
    }
}
