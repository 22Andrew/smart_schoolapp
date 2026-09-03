package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppLanguageRepository extends JpaRepository<AppLanguage, Long> {

    List<AppLanguage> findAllByOrderByNameAsc();

    Optional<AppLanguage> findByShortCodeIgnoreCase(String shortCode);

    boolean existsByShortCodeIgnoreCaseAndIdNot(String shortCode, Long id);

    Optional<AppLanguage> findFirstByIsDefaultTrue();
}
