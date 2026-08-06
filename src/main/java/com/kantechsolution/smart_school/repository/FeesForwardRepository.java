package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeesForward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeesForwardRepository extends JpaRepository<FeesForward, Long> {
    List<FeesForward> findByClassIdAndSectionIgnoreCase(Long classId, String section);

    Optional<FeesForward> findByStudentAdmissionId(Long studentAdmissionId);

    void deleteByClassIdAndSectionIgnoreCase(Long classId, String section);
}
