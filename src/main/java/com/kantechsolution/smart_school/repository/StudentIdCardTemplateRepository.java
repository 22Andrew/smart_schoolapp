package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentIdCardTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentIdCardTemplateRepository extends JpaRepository<StudentIdCardTemplate, Long> {
    List<StudentIdCardTemplate> findAllByOrderByIdDesc();
}
