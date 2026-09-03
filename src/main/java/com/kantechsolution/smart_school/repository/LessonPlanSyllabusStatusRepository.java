package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LessonPlanSyllabusStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LessonPlanSyllabusStatusRepository extends JpaRepository<LessonPlanSyllabusStatus, Long> {

    Optional<LessonPlanSyllabusStatus> findByTopicId(Long topicId);
}
