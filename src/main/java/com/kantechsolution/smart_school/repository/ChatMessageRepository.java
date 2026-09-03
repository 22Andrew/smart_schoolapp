package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByOwnerUsernameOrderBySentAtDesc(String ownerUsername);

    List<ChatMessage> findByOwnerUsernameAndContactTypeAndContactSourceIdOrderBySentAtAsc(
            String ownerUsername, String contactType, Long contactSourceId);
}
