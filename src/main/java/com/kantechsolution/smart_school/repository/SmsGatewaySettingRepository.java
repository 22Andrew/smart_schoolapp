package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SmsGatewaySetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SmsGatewaySettingRepository extends JpaRepository<SmsGatewaySetting, Long> {
    Optional<SmsGatewaySetting> findByGateway(String gateway);
}
