package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppCustomField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppCustomFieldRepository extends JpaRepository<AppCustomField, Long> {

    List<AppCustomField> findByBelongToOrderByWeightAscNameAsc(String belongTo);

    List<AppCustomField> findAllByOrderByBelongToAscWeightAscNameAsc();
}
