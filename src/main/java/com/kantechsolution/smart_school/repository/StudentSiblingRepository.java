package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentSibling;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSiblingRepository extends JpaRepository<StudentSibling, Long> {

    List<StudentSibling> findByStudentAdmissionIdOrderByIdAsc(Long studentAdmissionId);

    List<StudentSibling> findByDraftTokenOrderByIdAsc(String draftToken);

    boolean existsByStudentAdmissionIdAndSiblingAdmissionId(Long studentAdmissionId, Long siblingAdmissionId);

    boolean existsByDraftTokenAndSiblingAdmissionId(String draftToken, Long siblingAdmissionId);

    void deleteByStudentAdmissionIdAndSiblingAdmissionId(Long studentAdmissionId, Long siblingAdmissionId);

    void deleteByDraftToken(String draftToken);
}
