package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CommunicateSmsTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunicateSmsTemplateRepository extends JpaRepository<CommunicateSmsTemplate, Long> {
    List<CommunicateSmsTemplate> findAllByOrderByTitleAsc();

    Optional<CommunicateSmsTemplate> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
