package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseRatingReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OnlineCourseRatingReviewRepository extends JpaRepository<OnlineCourseRatingReview, Long> {
    List<OnlineCourseRatingReview> findByCourseIdOrderByIdAsc(Long courseId);

    List<OnlineCourseRatingReview> findByCourseTitleIgnoreCaseOrderByIdAsc(String courseTitle);
}
