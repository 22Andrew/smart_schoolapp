package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppAddonRepository extends JpaRepository<AppAddon, Long> {

    List<AppAddon> findAllByIsInstalledTrueOrderByNameAsc();

    Optional<AppAddon> findBySlug(String slug);
}
