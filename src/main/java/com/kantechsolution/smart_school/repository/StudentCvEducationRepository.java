package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCvEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCvEducationRepository extends JpaRepository<StudentCvEducation, Long> {

    List<StudentCvEducation> findByStudent_IdOrderBySortOrderAscIdAsc(Long studentId);

    void deleteByStudent_Id(Long studentId);
}
