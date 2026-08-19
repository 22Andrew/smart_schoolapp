package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FrontCmsMediaRepository extends JpaRepository<FrontCmsMedia, Long> {
    List<FrontCmsMedia> findAllByOrderByIdDesc();
}
