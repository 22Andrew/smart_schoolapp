package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.ContentTypeSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContentTypeSettingRepository extends JpaRepository<ContentTypeSetting, Long> {
    List<ContentTypeSetting> findAllByOrderByNameAsc();

    Optional<ContentTypeSetting> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
