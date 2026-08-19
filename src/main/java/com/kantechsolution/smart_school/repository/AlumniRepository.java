package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumniRepository extends JpaRepository<Alumni, Long> {
    List<Alumni> findAllByOrderByStudentNameAsc();
    List<Alumni> findByAdmissionNumberContainingIgnoreCase(String admissionNumber);
}
