package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunicateDeliveryService {

    private final CommunicateRecipientResolver recipientResolver;
    private final SystemMailService systemMailService;
    private final SystemSmsService systemSmsService;
    private final SystemPushService systemPushService;

    public CommunicateDeliveryResult deliverEmail(String subject,
                                                  String messageHtml,
                                                  String recipientType,
                                                  String recipientDetails,
                                                  String attachmentPath) {
        Collection<String> recipients = recipientResolver.resolveEmails(recipientType, recipientDetails);
        return systemMailService.sendToMany(recipients, subject, messageHtml, attachmentPath);
    }

    public CommunicateDeliveryResult deliverSms(String message,
                                                String recipientType,
                                                String recipientDetails,
                                                List<String> sendThrough) {
        return deliverSmsChannels(null, message, recipientType, recipientDetails, sendThrough);
    }

    public CommunicateDeliveryResult deliverSmsChannels(String title,
                                                        String message,
                                                        String recipientType,
                                                        String recipientDetails,
                                                        List<String> sendThrough) {
        boolean wantsSms = wantsChannel(sendThrough, "SMS", true);
        boolean wantsMobileApp = wantsChannel(sendThrough, "Mobile App", false);

        if (!wantsSms && !wantsMobileApp) {
            CommunicateDeliveryResult skipped = new CommunicateDeliveryResult();
            skipped.recordFailure("Select at least one send option: SMS or Mobile App.");
            return skipped;
        }

        CommunicateDeliveryResult result = new CommunicateDeliveryResult();
        if (wantsSms) {
            Collection<String> recipients = recipientResolver.resolvePhones(recipientType, recipientDetails);
            result.mergeFrom(systemSmsService.sendToMany(recipients, message));
        }
        if (wantsMobileApp) {
            Collection<CommunicateRecipientResolver.PushTarget> targets =
                    recipientResolver.resolvePushTargets(recipientType, recipientDetails);
            String pushTitle = title == null || title.isBlank() ? "Message" : title;
            result.mergeFrom(systemPushService.sendToMany(targets, pushTitle, message));
        }
        return result;
    }

    public CommunicateDeliveryResult deliverMobileApp(String title,
                                                      String message,
                                                      String recipientType,
                                                      String recipientDetails) {
        Collection<CommunicateRecipientResolver.PushTarget> targets =
                recipientResolver.resolvePushTargets(recipientType, recipientDetails);
        return systemPushService.sendToMany(targets, title, message);
    }

    private boolean wantsChannel(List<String> sendThrough, String channel, boolean defaultWhenEmpty) {
        if (sendThrough == null || sendThrough.isEmpty()) {
            return defaultWhenEmpty;
        }
        return sendThrough.stream().anyMatch(item -> channel.equalsIgnoreCase(item.trim()));
    }
}
