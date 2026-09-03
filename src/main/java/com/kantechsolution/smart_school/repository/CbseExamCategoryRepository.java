package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.CbseExamCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CbseExamCategoryRepository extends JpaRepository<CbseExamCategory, Long> {

    List<CbseExamCategory> findAllByOrderByCategoryNameAsc();

    Optional<CbseExamCategory> findByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCaseAndIdNot(String categoryName, Long id);
}
