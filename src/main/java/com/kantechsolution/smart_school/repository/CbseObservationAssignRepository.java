package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseObservationAssign;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CbseObservationAssignRepository extends JpaRepository<CbseObservationAssign, Long> {

    @EntityGraph(attributePaths = {"cbseObservation", "cbseExamTerm"})
    List<CbseObservationAssign> findAllByOrderByIdDesc();

    @EntityGraph(attributePaths = {"cbseObservation", "cbseExamTerm"})
    Optional<CbseObservationAssign> findById(Long id);

    boolean existsByCbseObservationIdAndCbseExamTermId(Long observationId, Long termId);

    boolean existsByCbseObservationIdAndCbseExamTermIdAndIdNot(Long observationId, Long termId, Long id);
}
