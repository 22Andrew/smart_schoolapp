package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.EmailConfig;
import com.kantechsolution.smart_school.repository.EmailConfigRepository;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SystemMailService {

    private static final Logger log = LoggerFactory.getLogger(SystemMailService.class);

    private final EmailConfigRepository emailConfigRepository;
    private final UploadStorage uploadStorage;

    @Transactional(readOnly = true)
    public boolean isConfigured() {
        EmailConfig config = currentConfig();
        return config != null && !isBlank(config.getSmtpServer()) && !isBlank(config.getFromEmail());
    }

    @Transactional(readOnly = true)
    public CommunicateDeliveryResult sendToMany(Collection<String> recipients,
                                                String subject,
                                                String htmlBody,
                                                String attachmentPath) {
        CommunicateDeliveryResult result = new CommunicateDeliveryResult();
        EmailConfig config = currentConfig();
        if (config == null || isBlank(config.getSmtpServer()) || isBlank(config.getFromEmail())) {
            result.recordFailure("Email is not configured. Save SMTP settings under System Settings > Email Config.");
            return result;
        }

        Set<String> uniqueRecipients = normalizeRecipients(recipients);
        if (uniqueRecipients.isEmpty()) {
            result.recordFailure("No valid email recipients were found.");
            return result;
        }

        Path attachment = resolveAttachment(attachmentPath);
        for (String recipient : uniqueRecipients) {
            try {
                sendHtmlEmail(config, recipient, subject, htmlBody, attachment);
                result.recordSuccess();
            } catch (Exception error) {
                log.error("Failed to send email to {}", recipient, error);
                result.recordFailure(recipient + ": " + error.getMessage());
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public boolean sendPlainTextEmail(String toEmail, String subject, String body) {
        CommunicateDeliveryResult result = sendToMany(Set.of(toEmail), subject, escapeHtml(body).replace("\n", "<br>"), null);
        return result.hasSent();
    }

    private void sendHtmlEmail(EmailConfig config,
                               String toEmail,
                               String subject,
                               String htmlBody,
                               Path attachment) throws Exception {
        Session session = buildMailSession(config);
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(config.getFromEmail()));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail, false));
        message.setSubject(subject, "UTF-8");

        if (attachment != null && Files.exists(attachment)) {
            MimeBodyPart textPart = new MimeBodyPart();
            textPart.setContent(wrapHtml(htmlBody), "text/html; charset=UTF-8");

            MimeBodyPart attachmentPart = new MimeBodyPart();
            attachmentPart.attachFile(attachment.toFile());

            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(textPart);
            multipart.addBodyPart(attachmentPart);
            message.setContent(multipart);
        } else {
            message.setContent(wrapHtml(htmlBody), "text/html; charset=UTF-8");
        }

        Transport.send(message);
    }

    private EmailConfig currentConfig() {
        return emailConfigRepository.findAll().stream().findFirst().orElse(null);
    }

    private Path resolveAttachment(String attachmentPath) {
        if (isBlank(attachmentPath)) {
            return null;
        }
        String normalized = attachmentPath.trim().replace("\\", "/");
        if (normalized.startsWith("/uploads/")) {
            normalized = normalized.substring("/uploads/".length());
        }
        return uploadStorage.getRoot().resolve(normalized);
    }

    private Set<String> normalizeRecipients(Collection<String> recipients) {
        Set<String> unique = new LinkedHashSet<>();
        if (recipients == null) {
            return unique;
        }
        for (String recipient : recipients) {
            if (recipient == null || recipient.isBlank() || !recipient.contains("@")) {
                continue;
            }
            unique.add(recipient.trim().toLowerCase(Locale.ROOT));
        }
        return unique;
    }

    private String wrapHtml(String htmlBody) {
        if (htmlBody == null || htmlBody.isBlank()) {
            return "<html><body></body></html>";
        }
        String trimmed = htmlBody.trim();
        if (trimmed.toLowerCase(Locale.ROOT).contains("<html")) {
            return trimmed;
        }
        return "<html><body>" + trimmed + "</body></html>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private Session buildMailSession(EmailConfig config) {
        Properties props = new Properties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.host", config.getSmtpServer());
        props.put("mail.smtp.port", String.valueOf(parsePort(config.getSmtpPort())));
        props.put("mail.smtp.auth", authEnabled(config.getSmtpAuth()) ? "true" : "false");

        String security = config.getSmtpSecurity() == null
                ? "tls"
                : config.getSmtpSecurity().trim().toLowerCase(Locale.ROOT);
        if ("ssl".equals(security)) {
            props.put("mail.smtp.ssl.enable", "true");
        } else if ("tls".equals(security)) {
            props.put("mail.smtp.starttls.enable", "true");
        }

        if (authEnabled(config.getSmtpAuth()) && !isBlank(config.getSmtpUsername())) {
            final String username = config.getSmtpUsername();
            final String password = config.getSmtpPassword() == null ? "" : config.getSmtpPassword();
            return Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(username, password);
                }
            });
        }

        return Session.getInstance(props);
    }

    private int parsePort(String port) {
        if (isBlank(port)) {
            return 587;
        }
        try {
            return Integer.parseInt(port.trim());
        } catch (NumberFormatException error) {
            return 587;
        }
    }

    private boolean authEnabled(String auth) {
        if (isBlank(auth)) {
            return true;
        }
        String normalized = auth.trim().toLowerCase(Locale.ROOT);
        return !"off".equals(normalized) && !"false".equals(normalized) && !"no".equals(normalized);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
