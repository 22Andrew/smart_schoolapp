package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseOfflinePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineCourseOfflinePaymentRepository extends JpaRepository<OnlineCourseOfflinePayment, Long> {

    List<OnlineCourseOfflinePayment> findByStudentAdmissionIdAndPaymentStatusIgnoreCase(
            Long studentAdmissionId, String paymentStatus);

    Optional<OnlineCourseOfflinePayment> findByStudentAdmissionIdAndCourseIdAndPaymentStatusIgnoreCase(
            Long studentAdmissionId, Long courseId, String paymentStatus);
}
