package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.MarksheetTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarksheetTemplateRepository extends JpaRepository<MarksheetTemplate, Long> {

    List<MarksheetTemplate> findAllByOrderByTemplateNameAsc();

    boolean existsByTemplateNameIgnoreCase(String templateName);

    boolean existsByTemplateNameIgnoreCaseAndIdNot(String templateName, Long id);
}
