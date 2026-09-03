package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppStudentProfileEditField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppStudentProfileEditFieldRepository extends JpaRepository<AppStudentProfileEditField, Long> {

    List<AppStudentProfileEditField> findAllByOrderBySortOrderAscNameAsc();

    Optional<AppStudentProfileEditField> findBySlug(String slug);
}
