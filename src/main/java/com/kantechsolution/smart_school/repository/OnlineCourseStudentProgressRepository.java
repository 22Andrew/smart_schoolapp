package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseStudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OnlineCourseStudentProgressRepository extends JpaRepository<OnlineCourseStudentProgress, Long> {

    List<OnlineCourseStudentProgress> findByStudentAdmissionId(Long studentAdmissionId);

    Optional<OnlineCourseStudentProgress> findByStudentAdmissionIdAndCourseId(Long studentAdmissionId, Long courseId);

    long countByStudentAdmissionId(Long studentAdmissionId);
}
