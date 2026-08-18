package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.InventoryItemStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemStockRepository extends JpaRepository<InventoryItemStock, Long> {

    @Query("""
            SELECT s FROM InventoryItemStock s
            JOIN FETCH s.item i
            JOIN FETCH i.category
            LEFT JOIN FETCH s.supplier
            LEFT JOIN FETCH s.store
            ORDER BY s.id DESC
            """)
    List<InventoryItemStock> findAllWithDetails();

    @Query("""
            SELECT s FROM InventoryItemStock s
            JOIN FETCH s.item i
            JOIN FETCH i.category
            LEFT JOIN FETCH s.supplier
            LEFT JOIN FETCH s.store
            WHERE s.id = :id
            """)
    Optional<InventoryItemStock> findDetailById(@Param("id") Long id);

    boolean existsByItem_Id(Long itemId);

    boolean existsByStore_Id(Long storeId);

    boolean existsBySupplier_Id(Long supplierId);
}
