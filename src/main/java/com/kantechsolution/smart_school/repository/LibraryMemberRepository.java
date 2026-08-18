package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.LibraryMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryMemberRepository extends JpaRepository<LibraryMember, Long> {

    List<LibraryMember> findAllByOrderByIdDesc();

    @Query("SELECT m FROM LibraryMember m LEFT JOIN FETCH m.studentAdmission LEFT JOIN FETCH m.staffMember WHERE m.isActive = true ORDER BY m.id DESC")
    List<LibraryMember> findActiveWithDetails();

    @Query("SELECT m FROM LibraryMember m LEFT JOIN FETCH m.studentAdmission LEFT JOIN FETCH m.staffMember WHERE m.id = :id")
    Optional<LibraryMember> findDetailById(@Param("id") Long id);

    Optional<LibraryMember> findByStudentAdmission_Id(Long studentAdmissionId);

    Optional<LibraryMember> findByStaffMember_Id(Long staffMemberId);

    boolean existsByStudentAdmission_Id(Long studentAdmissionId);

    boolean existsByStaffMember_Id(Long staffMemberId);
}
