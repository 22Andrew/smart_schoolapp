package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppPushToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppPushTokenRepository extends JpaRepository<AppPushToken, Long> {

    List<AppPushToken> findByUserTypeAndSourceIdAndIsActiveTrue(String userType, Long sourceId);

    Optional<AppPushToken> findByDeviceToken(String deviceToken);
}
