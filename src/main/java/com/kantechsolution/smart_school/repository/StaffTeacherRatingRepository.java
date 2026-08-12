package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffTeacherRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffTeacherRatingRepository extends JpaRepository<StaffTeacherRating, Long> {

    List<StaffTeacherRating> findAllByOrderByIdDesc();
}
