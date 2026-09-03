package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseObservationParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CbseObservationParameterRepository extends JpaRepository<CbseObservationParameter, Long> {

    List<CbseObservationParameter> findAllByOrderByParameterNameAsc();

    Optional<CbseObservationParameter> findByParameterNameIgnoreCase(String parameterName);

    boolean existsByParameterNameIgnoreCase(String parameterName);

    boolean existsByParameterNameIgnoreCaseAndIdNot(String parameterName, Long id);
}
