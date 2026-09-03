package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.InventoryItemStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemStoreRepository extends JpaRepository<InventoryItemStore, Long> {

    List<InventoryItemStore> findAllByOrderByNameAsc();

    Optional<InventoryItemStore> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
