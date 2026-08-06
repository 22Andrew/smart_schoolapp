package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OfflineBankPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfflineBankPaymentRepository extends JpaRepository<OfflineBankPayment, Long> {
    List<OfflineBankPayment> findAllByOrderByIdDesc();
}
