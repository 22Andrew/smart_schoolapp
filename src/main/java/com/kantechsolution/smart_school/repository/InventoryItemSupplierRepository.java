package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.InventoryItemSupplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemSupplierRepository extends JpaRepository<InventoryItemSupplier, Long> {

    List<InventoryItemSupplier> findAllByOrderByNameAsc();

    Optional<InventoryItemSupplier> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
