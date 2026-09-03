package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeeGroupAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeGroupAssignmentRepository extends JpaRepository<FeeGroupAssignment, Long> {
    List<FeeGroupAssignment> findByFeeGroupIdAndSessionYear(Long feeGroupId, String sessionYear);

    List<FeeGroupAssignment> findByStudentAdmissionIdAndSessionYear(Long studentAdmissionId, String sessionYear);

    List<FeeGroupAssignment> findBySessionYear(String sessionYear);

    void deleteByFeeGroupIdAndSessionYear(Long feeGroupId, String sessionYear);

    boolean existsByFeeGroupIdAndStudentAdmissionIdAndSessionYear(Long feeGroupId, Long studentAdmissionId, String sessionYear);
}
