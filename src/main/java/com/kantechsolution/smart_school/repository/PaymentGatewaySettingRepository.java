package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.PaymentGatewaySetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentGatewaySettingRepository extends JpaRepository<PaymentGatewaySetting, Long> {
    Optional<PaymentGatewaySetting> findByGateway(String gateway);
}
