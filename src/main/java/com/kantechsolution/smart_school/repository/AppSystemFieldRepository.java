package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppSystemField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppSystemFieldRepository extends JpaRepository<AppSystemField, Long> {

    List<AppSystemField> findByFieldTypeOrderBySortOrderAscNameAsc(String fieldType);

    Optional<AppSystemField> findByFieldTypeAndSlug(String fieldType, String slug);
}
