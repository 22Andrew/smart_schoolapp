package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StudentAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAdmissionRepository extends JpaRepository<StudentAdmission, Long> {

    List<StudentAdmission> findAllByOrderByIdDesc();

    Optional<StudentAdmission> findByAdmissionNoIgnoreCase(String admissionNo);

    boolean existsByAdmissionNoIgnoreCase(String admissionNo);

    @Query("""
            SELECT s FROM StudentAdmission s
            WHERE (:classId IS NULL OR s.schoolClass.id = :classId)
              AND (:section IS NULL OR :section = '' OR LOWER(s.section) = LOWER(:section))
              AND (:disabled IS NULL OR s.disabled = :disabled)
              AND (:onlineAdmission IS NULL OR s.onlineAdmission = :onlineAdmission)
              AND (
                   :keyword IS NULL OR :keyword = ''
                   OR LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(CONCAT(COALESCE(s.firstName, ''), ' ', COALESCE(s.lastName, ''))) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(s.rollNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(s.admissionNo, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(s.referenceNo, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(s.nationalId, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(s.localId, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(s.mobileNumber, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY s.id DESC
            """)
    List<StudentAdmission> search(
            @Param("classId") Long classId,
            @Param("section") String section,
            @Param("keyword") String keyword,
            @Param("disabled") Boolean disabled,
            @Param("onlineAdmission") Boolean onlineAdmission
    );
}
