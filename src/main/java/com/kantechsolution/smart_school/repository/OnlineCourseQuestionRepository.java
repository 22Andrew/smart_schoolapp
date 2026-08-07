package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineCourseQuestionRepository extends JpaRepository<OnlineCourseQuestion, Long> {

    @Query("""
            SELECT q FROM OnlineCourseQuestion q
            WHERE (:tagId IS NULL OR q.tag.id = :tagId)
              AND (:type IS NULL OR :type = '' OR LOWER(q.questionType) = LOWER(:type))
              AND (:level IS NULL OR :level = '' OR LOWER(q.level) = LOWER(:level))
              AND (:createdBy IS NULL OR :createdBy = '' OR LOWER(q.createdBy) = LOWER(:createdBy))
              AND (:keyword IS NULL OR :keyword = '' OR LOWER(q.questionText) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY q.id DESC
            """)
    List<OnlineCourseQuestion> search(
            @Param("tagId") Long tagId,
            @Param("type") String type,
            @Param("level") String level,
            @Param("createdBy") String createdBy,
            @Param("keyword") String keyword
    );

    @Query("SELECT DISTINCT q.createdBy FROM OnlineCourseQuestion q WHERE q.createdBy IS NOT NULL ORDER BY q.createdBy ASC")
    List<String> findDistinctCreatedBy();

    long countByTagId(Long tagId);
}
