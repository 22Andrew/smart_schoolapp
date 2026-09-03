package com.kantechsolution.smart_school.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunicateScheduledMessageJob {

    private static final Logger log = LoggerFactory.getLogger(CommunicateScheduledMessageJob.class);

    private final CommunicateService communicateService;

    @Scheduled(fixedDelayString = "${communicate.scheduler.delay-ms:60000}")
    public void dispatchDueMessages() {
        try {
            int processed = communicateService.processDueScheduledMessages();
            if (processed > 0) {
                log.info("Dispatched {} scheduled communicate message(s)", processed);
            }
        } catch (Exception error) {
            log.error("Failed to dispatch scheduled communicate messages", error);
        }
    }
}
