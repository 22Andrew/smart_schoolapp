package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineCourseCategoryRepository extends JpaRepository<OnlineCourseCategory, Long> {
    List<OnlineCourseCategory> findAllByOrderByCategoryNameAsc();

    Optional<OnlineCourseCategory> findByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCase(String categoryName);
}
