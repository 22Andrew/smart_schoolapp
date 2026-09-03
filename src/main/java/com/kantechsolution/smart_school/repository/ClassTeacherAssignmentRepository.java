package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ClassTeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassTeacherAssignmentRepository extends JpaRepository<ClassTeacherAssignment, Long> {

    List<ClassTeacherAssignment> findAllByOrderByIdDesc();

    Optional<ClassTeacherAssignment> findBySchoolClassIdAndSectionIgnoreCase(Long schoolClassId, String section);

    boolean existsBySchoolClassIdAndSectionIgnoreCaseAndIdNot(Long schoolClassId, String section, Long id);
}
