package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCourseCertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineCourseCertificateTemplateRepository extends JpaRepository<OnlineCourseCertificateTemplate, Long> {
    List<OnlineCourseCertificateTemplate> findAllByOrderByIdAsc();
}
