package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.SchoolHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for SchoolHouse entity
 */
@Repository
public interface SchoolHouseRepository extends JpaRepository<SchoolHouse, Long> {

    Optional<SchoolHouse> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<SchoolHouse> findAllByOrderByIdAsc();
}
