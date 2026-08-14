package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.CommunicateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class CommunicateController {

    private final CommunicateService communicateService;

    @GetMapping("/admin/notification")
    public String noticeBoardPage() {
        return "admin-notification";
    }

    @GetMapping("/communicate/noticeboard")
    public String noticeBoardLegacyRedirect() {
        return "redirect:/admin/notification";
    }

    @GetMapping("/admin/mailsms/compose")
    public String sendEmailComposePage() {
        return "communicate-sendemail";
    }

    @GetMapping("/communicate/sendemail")
    public String sendEmailPage() {
        return "redirect:/admin/mailsms/compose";
    }

    @GetMapping("/admin/mailsms/compose_sms")
    public String sendSmsComposePage() {
        return "communicate-sendsms";
    }

    @GetMapping("/communicate/sendsms")
    public String sendSmsPage() {
        return "redirect:/admin/mailsms/compose_sms";
    }

    @GetMapping("/admin/mailsms/index")
    public String mailSmsLogIndexPage() {
        return "communicate-mailsmslog";
    }

    @GetMapping("/communicate/mailsmslog")
    public String mailSmsLogPage() {
        return "redirect:/admin/mailsms/index";
    }

    @GetMapping("/admin/mailsms/schedule")
    public String scheduleLogIndexPage() {
        return "communicate-schedulelog";
    }

    @GetMapping("/communicate/schedulelog")
    public String scheduleLogPage() {
        return "redirect:/admin/mailsms/schedule";
    }

    @GetMapping("/communicate/logincredential")
    public String loginCredentialPage() {
        return "redirect:/student/bulkmail";
    }

    @GetMapping("/admin/mailsms/emailtemplate")
    public String emailTemplateIndexPage() {
        return "communicate-emailtemplate";
    }

    @GetMapping("/communicate/emailtemplate")
    public String emailTemplatePage() {
        return "redirect:/admin/mailsms/emailtemplate";
    }

    @GetMapping("/admin/mailsms/smsemplate")
    public String smsTemplateIndexPage() {
        return "communicate-smstemplate";
    }

    @GetMapping("/communicate/smstemplate")
    public String smsTemplatePage() {
        return "redirect:/admin/mailsms/smsemplate";
    }

    // ---------- Notice Board API ----------

    @GetMapping("/api/communicate/notices")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listNotices() {
        return ResponseEntity.ok(communicateService.listNotices());
    }

    @PostMapping(value = "/api/communicate/notices", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveNotice(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> communicateService.saveNotice(payload), "Notice saved successfully!");
    }

    @PostMapping(value = "/api/communicate/notices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveNoticeMultipart(
            @RequestParam String title,
            @RequestParam String noticeDate,
            @RequestParam String publishOn,
            @RequestParam String message,
            @RequestParam String messageTo,
            @RequestParam(required = false, defaultValue = "false") boolean sendByEmail,
            @RequestParam(required = false, defaultValue = "false") boolean sendBySms,
            @RequestParam(required = false) MultipartFile attachment) {
        Map<String, Object> payload = buildNoticePayload(title, noticeDate, publishOn, message, messageTo, sendByEmail, sendBySms, null);
        return saveResponse(() -> communicateService.saveNotice(payload, attachment), "Notice saved successfully!");
    }

    @PutMapping(value = "/api/communicate/notices/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateNotice(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        payload.put("id", id);
        return saveResponse(() -> communicateService.saveNotice(payload), "Notice updated successfully!");
    }

    @PutMapping(value = "/api/communicate/notices/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateNoticeMultipart(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String noticeDate,
            @RequestParam String publishOn,
            @RequestParam String message,
            @RequestParam String messageTo,
            @RequestParam(required = false, defaultValue = "false") boolean sendByEmail,
            @RequestParam(required = false, defaultValue = "false") boolean sendBySms,
            @RequestParam(required = false) MultipartFile attachment) {
        Map<String, Object> payload = buildNoticePayload(title, noticeDate, publishOn, message, messageTo, sendByEmail, sendBySms, id);
        return saveResponse(() -> communicateService.saveNotice(payload, attachment), "Notice updated successfully!");
    }

    private Map<String, Object> buildNoticePayload(
            String title,
            String noticeDate,
            String publishOn,
            String message,
            String messageTo,
            boolean sendByEmail,
            boolean sendBySms,
            Long id) {
        Map<String, Object> payload = new HashMap<>();
        if (id != null) {
            payload.put("id", id);
        }
        payload.put("title", title);
        payload.put("noticeDate", noticeDate);
        payload.put("publishOn", publishOn);
        payload.put("message", message);
        payload.put("messageTo", messageTo);
        payload.put("sendByEmail", sendByEmail);
        payload.put("sendBySms", sendBySms);
        payload.put("showOnWebsite", true);
        return payload;
    }

    @DeleteMapping("/api/communicate/notices/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteNotice(@PathVariable Long id) {
        return deleteResponse(() -> communicateService.deleteNotice(id), "Notice deleted successfully!");
    }

    @DeleteMapping("/api/communicate/notices")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteAllNotices() {
        return deleteResponse(() -> communicateService.deleteAllNotices(), "Notice board cleared successfully!");
    }

    // ---------- Message API ----------

    @GetMapping("/api/communicate/messages")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listMessages(
            @RequestParam(required = false) String messageType,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(communicateService.listMessageLogs(messageType, status));
    }

    @PostMapping("/api/communicate/messages/send")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> communicateService.sendMessage(payload), "Message sent and saved successfully!");
    }

    @PostMapping("/api/communicate/messages/schedule")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> scheduleMessage(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> communicateService.scheduleMessage(payload), "Message scheduled successfully!");
    }

    @GetMapping("/api/communicate/compose/birthdays")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listTodayBirthdays() {
        return ResponseEntity.ok(communicateService.listTodayBirthdayStudents());
    }

    @PostMapping(value = "/api/communicate/messages/send-email", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendEmailCompose(
            @RequestParam String composeTab,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String recipientType,
            @RequestParam String recipientDetails,
            @RequestParam(required = false, defaultValue = "NOW") String sendMode,
            @RequestParam(required = false) String scheduledAt,
            @RequestParam(required = false) Long emailTemplateId,
            @RequestParam(required = false) MultipartFile attachment) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("composeTab", composeTab);
        payload.put("title", title);
        payload.put("message", message);
        payload.put("recipientType", recipientType);
        payload.put("recipientDetails", recipientDetails);
        payload.put("sendMode", sendMode);
        payload.put("scheduledAt", scheduledAt);
        payload.put("emailTemplateId", emailTemplateId);
        String successMessage = "SCHEDULE".equalsIgnoreCase(sendMode)
                ? "Email scheduled successfully!"
                : "Email sent and saved successfully!";
        return saveResponse(() -> communicateService.sendEmailCompose(payload, attachment), successMessage);
    }

    @PostMapping("/api/communicate/messages/send-sms")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendSmsCompose(@RequestBody Map<String, Object> payload) {
        String successMessage = "SCHEDULE".equalsIgnoreCase(String.valueOf(payload.getOrDefault("sendMode", "NOW")))
                ? "SMS scheduled successfully!"
                : "SMS sent and saved successfully!";
        return saveResponse(() -> communicateService.sendSmsCompose(payload), successMessage);
    }

    @DeleteMapping("/api/communicate/messages/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long id) {
        return deleteResponse(() -> communicateService.deleteMessageLog(id), "Message log deleted successfully!");
    }

    @DeleteMapping("/api/communicate/messages")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteAllMessages() {
        return deleteResponse(() -> communicateService.deleteAllMessageLogs(), "Email / SMS logs deleted successfully!");
    }

    // ---------- Email Template API ----------

    @GetMapping("/api/communicate/email-templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listEmailTemplates() {
        return ResponseEntity.ok(communicateService.listEmailTemplates());
    }

    @PostMapping(value = "/api/communicate/email-templates", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createEmailTemplate(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> communicateService.saveEmailTemplate(payload), "Email template saved successfully!");
    }

    @PostMapping(value = "/api/communicate/email-templates", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createEmailTemplateMultipart(
            @RequestParam String title,
            @RequestParam String templateBody,
            @RequestParam(required = false) MultipartFile attachment) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("templateBody", templateBody);
        return saveResponse(() -> communicateService.saveEmailTemplate(payload, attachment), "Email template saved successfully!");
    }

    @PutMapping(value = "/api/communicate/email-templates/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateEmailTemplate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        payload.put("id", id);
        return saveResponse(() -> communicateService.saveEmailTemplate(payload), "Email template updated successfully!");
    }

    @PutMapping(value = "/api/communicate/email-templates/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateEmailTemplateMultipart(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String templateBody,
            @RequestParam(required = false) MultipartFile attachment) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", id);
        payload.put("title", title);
        payload.put("templateBody", templateBody);
        return saveResponse(() -> communicateService.saveEmailTemplate(payload, attachment), "Email template updated successfully!");
    }

    @DeleteMapping("/api/communicate/email-templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteEmailTemplate(@PathVariable Long id) {
        return deleteResponse(() -> communicateService.deleteEmailTemplate(id), "Email template deleted successfully!");
    }

    // ---------- SMS Template API ----------

    @GetMapping("/api/communicate/sms-templates")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listSmsTemplates() {
        return ResponseEntity.ok(communicateService.listSmsTemplates());
    }

    @PostMapping("/api/communicate/sms-templates")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createSmsTemplate(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> communicateService.saveSmsTemplate(payload), "SMS template saved successfully!");
    }

    @PutMapping("/api/communicate/sms-templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateSmsTemplate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        payload.put("id", id);
        return saveResponse(() -> communicateService.saveSmsTemplate(payload), "SMS template updated successfully!");
    }

    @DeleteMapping("/api/communicate/sms-templates/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteSmsTemplate(@PathVariable Long id) {
        return deleteResponse(() -> communicateService.deleteSmsTemplate(id), "SMS template deleted successfully!");
    }

    // ---------- Login Credential API ----------

    @GetMapping("/api/communicate/login-credentials")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> listLoginCredentials() {
        return ResponseEntity.ok(communicateService.listLoginCredentialLogs());
    }

    @PostMapping("/api/communicate/login-credentials/send")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendLoginCredentials(@RequestBody Map<String, Object> payload) {
        return saveResponse(() -> communicateService.sendLoginCredentials(payload), "Login credentials send recorded successfully!");
    }

    @DeleteMapping("/api/communicate/login-credentials/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLoginCredential(@PathVariable Long id) {
        return deleteResponse(() -> communicateService.deleteLoginCredentialLog(id), "Login credential log deleted successfully!");
    }

    private ResponseEntity<Map<String, Object>> saveResponse(SaveAction action, String successMessage) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.run();
            response.put("success", true);
            response.put("message", successMessage);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Operation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private ResponseEntity<Map<String, Object>> deleteResponse(DeleteAction action, String successMessage) {
        Map<String, Object> response = new HashMap<>();
        try {
            action.run();
            response.put("success", true);
            response.put("message", successMessage);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Operation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @FunctionalInterface
    private interface SaveAction {
        Map<String, Object> run();
    }

    @FunctionalInterface
    private interface DeleteAction {
        void run();
    }
}
