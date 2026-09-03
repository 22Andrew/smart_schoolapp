package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentClassAssignmentRepository extends JpaRepository<StudentClassAssignment, Long> {
    List<StudentClassAssignment> findByStudentAdmissionIdOrderByIdAsc(Long studentAdmissionId);

    void deleteByStudentAdmissionId(Long studentAdmissionId);
}
