package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {

    List<StudentDocument> findByStudentAdmissionIdOrderByCreatedAtDescIdDesc(Long studentAdmissionId);

    long countByStudentAdmissionId(Long studentAdmissionId);
}
