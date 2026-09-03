package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineCourseRepository extends JpaRepository<OnlineCourse, Long> {
    List<OnlineCourse> findAllByOrderByIdDesc();
}
