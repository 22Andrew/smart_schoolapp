package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppStudentDashboardWidget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppStudentDashboardWidgetRepository extends JpaRepository<AppStudentDashboardWidget, Long> {

    List<AppStudentDashboardWidget> findAllByOrderBySortOrderAscNameAsc();

    Optional<AppStudentDashboardWidget> findBySlug(String slug);
}
