package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StudentCategory entity
 */
@Repository
public interface StudentCategoryRepository extends JpaRepository<StudentCategory, Long> {

    Optional<StudentCategory> findByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCase(String categoryName);

    List<StudentCategory> findAllByOrderByIdAsc();
}
