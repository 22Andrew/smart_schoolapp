package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsNews;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FrontCmsNewsRepository extends JpaRepository<FrontCmsNews, Long> {
    List<FrontCmsNews> findAllByOrderByNewsDateDescIdDesc();
}
