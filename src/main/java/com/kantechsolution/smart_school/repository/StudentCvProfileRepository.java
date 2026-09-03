package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentCvProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentCvProfileRepository extends JpaRepository<StudentCvProfile, Long> {

    Optional<StudentCvProfile> findByStudent_Id(Long studentId);
}
