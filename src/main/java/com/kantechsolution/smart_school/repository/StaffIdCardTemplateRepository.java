package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffIdCardTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffIdCardTemplateRepository extends JpaRepository<StaffIdCardTemplate, Long> {
    List<StaffIdCardTemplate> findAllByOrderByIdDesc();
}
