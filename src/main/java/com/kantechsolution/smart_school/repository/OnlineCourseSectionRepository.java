package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineCourseSectionRepository extends JpaRepository<OnlineCourseSection, Long> {
    List<OnlineCourseSection> findByCourseIdOrderBySortOrderAscIdAsc(Long courseId);

    long countByCourseId(Long courseId);
}
