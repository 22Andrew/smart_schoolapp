package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppSidebarMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppSidebarMenuItemRepository extends JpaRepository<AppSidebarMenuItem, Long> {

    List<AppSidebarMenuItem> findBySelectedInSidebarOrderBySortOrderAscNameAsc(boolean selectedInSidebar);

    Optional<AppSidebarMenuItem> findBySlug(String slug);
}
