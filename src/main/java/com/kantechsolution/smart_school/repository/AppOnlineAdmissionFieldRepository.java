package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppOnlineAdmissionField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppOnlineAdmissionFieldRepository extends JpaRepository<AppOnlineAdmissionField, Long> {

    List<AppOnlineAdmissionField> findAllByOrderBySortOrderAscNameAsc();

    Optional<AppOnlineAdmissionField> findBySlug(String slug);

    Optional<AppOnlineAdmissionField> findByCustomFieldId(Long customFieldId);

    void deleteByCustomFieldId(Long customFieldId);
}
