package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCvWorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCvWorkExperienceRepository extends JpaRepository<StudentCvWorkExperience, Long> {

    List<StudentCvWorkExperience> findByStudent_IdOrderBySortOrderAscIdAsc(Long studentId);

    void deleteByStudent_Id(Long studentId);
}
