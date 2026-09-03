package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseAdmitCardTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CbseAdmitCardTemplateRepository extends JpaRepository<CbseAdmitCardTemplate, Long> {

    List<CbseAdmitCardTemplate> findAllByOrderByTemplateNameAsc();

    Optional<CbseAdmitCardTemplate> findByDefaultTemplateTrue();

    boolean existsByTemplateNameIgnoreCase(String templateName);

    boolean existsByTemplateNameIgnoreCaseAndIdNot(String templateName, Long id);
}
