package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

    List<NotificationSetting> findAllByIsActiveTrueOrderBySortOrderAsc();

    Optional<NotificationSetting> findByEventKey(String eventKey);
}
