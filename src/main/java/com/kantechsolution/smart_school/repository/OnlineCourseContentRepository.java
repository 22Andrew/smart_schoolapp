package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineCourseContentRepository extends JpaRepository<OnlineCourseContent, Long> {
    List<OnlineCourseContent> findBySectionIdOrderBySortOrderAscIdAsc(Long sectionId);

    long countBySectionId(Long sectionId);
}
