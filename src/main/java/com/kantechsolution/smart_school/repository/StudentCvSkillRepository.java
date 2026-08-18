package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCvSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCvSkillRepository extends JpaRepository<StudentCvSkill, Long> {

    List<StudentCvSkill> findByStudent_IdOrderBySortOrderAscIdAsc(Long studentId);

    void deleteByStudent_Id(Long studentId);
}
