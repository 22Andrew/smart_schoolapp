package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppModuleRepository extends JpaRepository<AppModule, Long> {

    List<AppModule> findByModuleTypeOrderBySortOrderAscNameAsc(String moduleType);

    Optional<AppModule> findByModuleTypeAndSlug(String moduleType, String slug);
}
