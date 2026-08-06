package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.FeeDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeDiscountRepository extends JpaRepository<FeeDiscount, Long> {
    List<FeeDiscount> findAllByOrderByIdAsc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByDiscountCodeIgnoreCase(String discountCode);

    Optional<FeeDiscount> findByNameIgnoreCase(String name);

    Optional<FeeDiscount> findByDiscountCodeIgnoreCase(String discountCode);
}
