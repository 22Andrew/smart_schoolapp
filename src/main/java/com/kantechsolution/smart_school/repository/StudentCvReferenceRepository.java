package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCvReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCvReferenceRepository extends JpaRepository<StudentCvReference, Long> {

    List<StudentCvReference> findByStudent_IdOrderBySortOrderAscIdAsc(Long studentId);

    void deleteByStudent_Id(Long studentId);
}
