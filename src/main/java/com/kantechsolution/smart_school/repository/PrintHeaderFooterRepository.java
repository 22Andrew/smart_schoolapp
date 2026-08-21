package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.PrintHeaderFooter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrintHeaderFooterRepository extends JpaRepository<PrintHeaderFooter, Long> {
    Optional<PrintHeaderFooter> findByDocumentType(String documentType);
}
