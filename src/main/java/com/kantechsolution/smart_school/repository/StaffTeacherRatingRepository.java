package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.StaffTeacherRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffTeacherRatingRepository extends JpaRepository<StaffTeacherRating, Long> {

    List<StaffTeacherRating> findAllByOrderByIdDesc();

    List<StaffTeacherRating> findByStudentAdmissionNoOrderByIdDesc(String studentAdmissionNo);

    Optional<StaffTeacherRating> findByStaffMemberIdAndStudentAdmissionNo(Long staffMemberId, String studentAdmissionNo);
}
