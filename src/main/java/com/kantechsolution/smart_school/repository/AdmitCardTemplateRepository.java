package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AdmitCardTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmitCardTemplateRepository extends JpaRepository<AdmitCardTemplate, Long> {

    List<AdmitCardTemplate> findAllByOrderByTemplateNameAsc();

    boolean existsByTemplateNameIgnoreCase(String templateName);

    boolean existsByTemplateNameIgnoreCaseAndIdNot(String templateName, Long id);
}
