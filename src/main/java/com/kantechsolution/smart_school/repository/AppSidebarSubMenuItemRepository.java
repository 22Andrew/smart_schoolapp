package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppSidebarSubMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppSidebarSubMenuItemRepository extends JpaRepository<AppSidebarSubMenuItem, Long> {

    List<AppSidebarSubMenuItem> findByParentMenuSlugOrderBySortOrderAscNameAsc(String parentMenuSlug);

    List<AppSidebarSubMenuItem> findAllByOrderByParentMenuSlugAscSortOrderAscNameAsc();

    Optional<AppSidebarSubMenuItem> findByParentMenuSlugAndSlug(String parentMenuSlug, String slug);

    void deleteByParentMenuSlugNotIn(Iterable<String> parentMenuSlugs);
}
