package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CommunicateEmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunicateEmailTemplateRepository extends JpaRepository<CommunicateEmailTemplate, Long> {
    List<CommunicateEmailTemplate> findAllByOrderByTitleAsc();

    Optional<CommunicateEmailTemplate> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
