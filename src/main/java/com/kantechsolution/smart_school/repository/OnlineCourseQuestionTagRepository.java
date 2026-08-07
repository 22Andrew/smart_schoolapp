package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseQuestionTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineCourseQuestionTagRepository extends JpaRepository<OnlineCourseQuestionTag, Long> {
    List<OnlineCourseQuestionTag> findAllByOrderByTagNameAsc();

    Optional<OnlineCourseQuestionTag> findByTagNameIgnoreCase(String tagName);

    boolean existsByTagNameIgnoreCase(String tagName);
}
