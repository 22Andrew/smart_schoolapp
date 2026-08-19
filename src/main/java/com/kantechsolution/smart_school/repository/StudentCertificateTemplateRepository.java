package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentCertificateTemplateRepository extends JpaRepository<StudentCertificateTemplate, Long> {
    List<StudentCertificateTemplate> findAllByOrderByIdDesc();
}
