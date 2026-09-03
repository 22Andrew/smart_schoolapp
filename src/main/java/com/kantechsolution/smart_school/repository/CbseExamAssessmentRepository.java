package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CbseExamAssessmentRepository extends JpaRepository<CbseExamAssessment, Long> {

    @Query("SELECT DISTINCT a FROM CbseExamAssessment a LEFT JOIN FETCH a.details ORDER BY a.assessmentName ASC")
    List<CbseExamAssessment> findAllByOrderByAssessmentNameAsc();

    @Query("SELECT a FROM CbseExamAssessment a LEFT JOIN FETCH a.details WHERE a.id = :id")
    Optional<CbseExamAssessment> findByIdWithDetails(@Param("id") Long id);

    boolean existsByAssessmentNameIgnoreCase(String assessmentName);

    boolean existsByAssessmentNameIgnoreCaseAndIdNot(String assessmentName, Long id);
}
