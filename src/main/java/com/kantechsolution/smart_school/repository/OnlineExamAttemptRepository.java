package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineExamAttemptRepository extends JpaRepository<OnlineExamAttempt, Long> {

    long countByOnlineExamIdAndStudentAdmissionIdAndSubmittedTrue(Long onlineExamId, Long studentAdmissionId);

    Optional<OnlineExamAttempt> findFirstByOnlineExamIdAndStudentAdmissionIdAndSubmittedFalseOrderByAttemptNumberDesc(
            Long onlineExamId, Long studentAdmissionId);

    Optional<OnlineExamAttempt> findFirstByOnlineExamIdAndStudentAdmissionIdOrderByAttemptNumberDesc(
            Long onlineExamId, Long studentAdmissionId);

    List<OnlineExamAttempt> findByOnlineExamIdAndStudentAdmissionIdOrderByAttemptNumberAsc(
            Long onlineExamId, Long studentAdmissionId);
}
