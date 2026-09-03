package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CbseExamTermRepository extends JpaRepository<CbseExamTerm, Long> {

    List<CbseExamTerm> findAllByOrderByTermNameAsc();

    boolean existsByTermCodeIgnoreCase(String termCode);

    boolean existsByTermCodeIgnoreCaseAndIdNot(String termCode, Long id);

    Optional<CbseExamTerm> findByTermCodeIgnoreCase(String termCode);
}
