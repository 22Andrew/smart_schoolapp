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

    List<StudentAdmission> findByDisabledFalseOrderByFirstNameAscLastNameAsc();

    boolean existsByHostelRoom_Id(Long hostelRoomId);

    long countByHostelRoom_Id(Long hostelRoomId);

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

    @Query("""
            SELECT s.admissionNo FROM StudentAdmission s
            WHERE :prefix = '' OR LOWER(s.admissionNo) LIKE LOWER(CONCAT(:prefix, '%'))
            """)
    List<String> findAdmissionNosByPrefix(@Param("prefix") String prefix);

    List<StudentAdmission> findByEmailIgnoreCase(String email);

    List<StudentAdmission> findByGuardianEmailIgnoreCase(String guardianEmail);

    @Query("""
            SELECT s FROM StudentAdmission s
            WHERE s.disabled = false
              AND s.dateOfBirth IS NOT NULL
              AND MONTH(s.dateOfBirth) = :month
              AND DAY(s.dateOfBirth) = :day
            ORDER BY s.firstName ASC, s.lastName ASC
            """)
    List<StudentAdmission> findActiveByBirthday(@Param("month") int month, @Param("day") int day);
}
