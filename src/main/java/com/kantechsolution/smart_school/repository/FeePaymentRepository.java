package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudentAdmissionIdAndSessionYearOrderByIdAsc(Long studentAdmissionId, String sessionYear);

    List<FeePayment> findByStudentAdmissionIdAndFeeMasterIdOrderByIdAsc(Long studentAdmissionId, Long feeMasterId);

    Optional<FeePayment> findByPaymentRefIgnoreCase(String paymentRef);

    List<FeePayment> findByPaymentRefContainingIgnoreCaseOrderByIdDesc(String paymentRef);

    List<FeePayment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);

    List<FeePayment> findBySessionYear(String sessionYear);

    void deleteByIdAndStudentAdmissionId(Long id, Long studentAdmissionId);
}
