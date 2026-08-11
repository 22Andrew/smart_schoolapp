package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseObservation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CbseObservationRepository extends JpaRepository<CbseObservation, Long> {

    @EntityGraph(attributePaths = {"details", "details.parameter"})
    List<CbseObservation> findAllByOrderByObservationNameAsc();

    @EntityGraph(attributePaths = {"details", "details.parameter"})
    Optional<CbseObservation> findById(Long id);

    boolean existsByObservationNameIgnoreCase(String observationName);

    boolean existsByObservationNameIgnoreCaseAndIdNot(String observationName, Long id);
}
