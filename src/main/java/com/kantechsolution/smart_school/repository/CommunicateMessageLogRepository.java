package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CommunicateMessageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CommunicateMessageLogRepository extends JpaRepository<CommunicateMessageLog, Long> {
    List<CommunicateMessageLog> findByStatusOrderByCreatedAtDesc(String status);

    List<CommunicateMessageLog> findByMessageTypeOrderByCreatedAtDesc(String messageType);

    List<CommunicateMessageLog> findAllByOrderByCreatedAtDesc();

    List<CommunicateMessageLog> findByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
            String status, LocalDateTime scheduledAt);
}
