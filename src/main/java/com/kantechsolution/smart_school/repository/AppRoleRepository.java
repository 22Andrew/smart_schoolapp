package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppRoleRepository extends JpaRepository<AppRole, Long> {

    List<AppRole> findAllByOrderByIdAsc();

    Optional<AppRole> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
