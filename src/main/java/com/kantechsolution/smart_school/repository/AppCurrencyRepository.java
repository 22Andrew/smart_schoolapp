package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppCurrency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppCurrencyRepository extends JpaRepository<AppCurrency, Long> {

    List<AppCurrency> findAllByOrderByShortCodeAsc();

    Optional<AppCurrency> findByShortCodeIgnoreCase(String shortCode);

    Optional<AppCurrency> findFirstByIsBaseTrue();

    Optional<AppCurrency> findFirstByIsCurrentTrue();
}
