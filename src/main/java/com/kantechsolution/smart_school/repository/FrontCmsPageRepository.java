package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FrontCmsPageRepository extends JpaRepository<FrontCmsPage, Long> {
    List<FrontCmsPage> findAllByOrderByIdAsc();
    Optional<FrontCmsPage> findFirstBySlugIgnoreCase(String slug);
}
