package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FrontCmsMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FrontCmsMenuItemRepository extends JpaRepository<FrontCmsMenuItem, Long> {
    List<FrontCmsMenuItem> findByMenuIdOrderBySortOrderAscIdAsc(Long menuId);
    List<FrontCmsMenuItem> findByParentIdOrderBySortOrderAscIdAsc(Long parentId);
}
