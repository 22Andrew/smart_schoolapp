package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsBanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FrontCmsBannerRepository extends JpaRepository<FrontCmsBanner, Long> {
    List<FrontCmsBanner> findAllByOrderByIdDesc();
    boolean existsByMediaId(Long mediaId);
}
