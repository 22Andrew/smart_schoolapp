package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FrontCmsMenuRepository extends JpaRepository<FrontCmsMenu, Long> {
    List<FrontCmsMenu> findAllByOrderByIdAsc();
    Optional<FrontCmsMenu> findFirstByNameIgnoreCase(String name);
}
