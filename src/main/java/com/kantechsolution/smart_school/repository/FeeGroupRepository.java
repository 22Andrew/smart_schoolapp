package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeGroupRepository extends JpaRepository<FeeGroup, Long> {
    List<FeeGroup> findAllByOrderByIdAsc();

    boolean existsByNameIgnoreCase(String name);

    Optional<FeeGroup> findByNameIgnoreCase(String name);
}
