package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    @Query("SELECT i FROM InventoryItem i JOIN FETCH i.category WHERE i.category.id = :categoryId ORDER BY i.name ASC")
    List<InventoryItem> findByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT i FROM InventoryItem i JOIN FETCH i.category ORDER BY i.name ASC")
    List<InventoryItem> findAllWithCategory();

    @Query("SELECT i FROM InventoryItem i JOIN FETCH i.category WHERE i.id = :id")
    Optional<InventoryItem> findDetailById(@Param("id") Long id);

    boolean existsByNameIgnoreCaseAndCategory_Id(String name, Long categoryId);

    boolean existsByNameIgnoreCaseAndCategory_IdAndIdNot(String name, Long categoryId, Long id);

    boolean existsByCategory_Id(Long categoryId);
}
