package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByOwnerUsernameOrderBySentAtDesc(String ownerUsername);

    List<ChatMessage> findByOwnerUsernameAndContactTypeAndContactSourceIdOrderBySentAtAsc(
            String ownerUsername, String contactType, Long contactSourceId);

    @Query("""
            SELECT COUNT(m) FROM ChatMessage m
            WHERE LOWER(m.ownerUsername) = LOWER(:owner)
              AND m.sentByOwner = false
              AND (m.readByOwner IS NULL OR m.readByOwner = false)
            """)
    long countUnreadIncoming(@Param("owner") String owner);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ChatMessage m
            SET m.readByOwner = true
            WHERE LOWER(m.ownerUsername) = LOWER(:owner)
              AND m.contactType = :contactType
              AND m.contactSourceId = :contactSourceId
              AND m.sentByOwner = false
              AND (m.readByOwner IS NULL OR m.readByOwner = false)
            """)
    int markConversationRead(@Param("owner") String owner,
                             @Param("contactType") String contactType,
                             @Param("contactSourceId") Long contactSourceId);
}
