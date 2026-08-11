package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CbseExamTemplateRepository extends JpaRepository<CbseExamTemplate, Long> {

    List<CbseExamTemplate> findAllByOrderByTemplateNameAsc();

    boolean existsByTemplateNameIgnoreCase(String templateName);

    boolean existsByTemplateNameIgnoreCaseAndIdNot(String templateName, Long id);
}
