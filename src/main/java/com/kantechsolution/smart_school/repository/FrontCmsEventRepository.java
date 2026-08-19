package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FrontCmsEventRepository extends JpaRepository<FrontCmsEvent, Long> {

    List<FrontCmsEvent> findAllByOrderByStartDateDescIdDesc();
}
