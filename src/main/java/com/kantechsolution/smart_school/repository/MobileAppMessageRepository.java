package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.MobileAppMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MobileAppMessageRepository extends JpaRepository<MobileAppMessage, Long> {

    List<MobileAppMessage> findByUserTypeAndSourceIdAndIsActiveTrueOrderByCreatedAtDesc(
            String userType, Long sourceId);
}
