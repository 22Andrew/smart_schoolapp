package com.kantechsolution.smart_school.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "online_course_rating_reviews")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineCourseRatingReview extends BaseEntity {

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "course_title", length = 255)
    private String courseTitle;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "admission_no", length = 50)
    private String admissionNo;

    @Column(name = "rating", nullable = false)
    private Integer rating = 4;

    @Column(name = "review_text", length = 500)
    private String reviewText;
}
