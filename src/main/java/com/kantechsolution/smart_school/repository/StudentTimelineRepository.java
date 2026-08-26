package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentTimelineRepository extends JpaRepository<StudentTimeline, Long> {

    long countByStudentAdmissionId(Long studentAdmissionId);

    List<StudentTimeline> findByStudentAdmissionIdAndVisibleToStudentTrueOrderByEventDateAscIdAsc(
            Long studentAdmissionId
    );
}
