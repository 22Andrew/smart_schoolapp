package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {

    Optional<StaffMember> findByStaffId(String staffId);

    Optional<StaffMember> findByEmail(String email);

    boolean existsByStaffIdAndIdNot(String staffId, Long id);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<StaffMember> findByDisabledFalseOrderByFirstNameAscLastNameAsc();

    List<StaffMember> findByDisabledTrueOrderByFirstNameAscLastNameAsc();

    @Query("""
            SELECT s FROM StaffMember s
            WHERE s.disabled = true
            AND (:role IS NULL OR :role = '' OR LOWER(s.roles) LIKE LOWER(CONCAT('%', :role, '%')))
            AND (:keyword IS NULL OR :keyword = '' OR
                 LOWER(s.staffId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(CONCAT(s.firstName, ' ', COALESCE(s.lastName, ''))) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.roles) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.designation) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.department) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(COALESCE(s.location, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY s.firstName ASC, s.lastName ASC
            """)
    List<StaffMember> searchDisabled(@Param("role") String role, @Param("keyword") String keyword);

    @Query("""
            SELECT s FROM StaffMember s
            WHERE s.disabled = false
            AND (:role IS NULL OR :role = '' OR LOWER(s.roles) LIKE LOWER(CONCAT('%', :role, '%')))
            AND (:keyword IS NULL OR :keyword = '' OR
                 LOWER(s.staffId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.roles) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.designation) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                 LOWER(s.department) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY s.firstName ASC, s.lastName ASC
            """)
    List<StaffMember> search(@Param("role") String role, @Param("keyword") String keyword);

    @Query("""
            SELECT s.staffId FROM StaffMember s
            WHERE :prefix = '' OR LOWER(s.staffId) LIKE LOWER(CONCAT(:prefix, '%'))
            """)
    List<String> findStaffIdsByPrefix(@Param("prefix") String prefix);
}
