package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeTypeRepository extends JpaRepository<FeeType, Long> {
    List<FeeType> findAllByOrderByIdAsc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByFeesCodeIgnoreCase(String feesCode);

    Optional<FeeType> findByNameIgnoreCase(String name);

    Optional<FeeType> findByFeesCodeIgnoreCase(String feesCode);
}
