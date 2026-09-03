package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.InventoryIssueItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryIssueItemRepository extends JpaRepository<InventoryIssueItem, Long> {

    @Query("SELECT i FROM InventoryIssueItem i JOIN FETCH i.item it JOIN FETCH it.category LEFT JOIN FETCH i.issuedBy ORDER BY i.id DESC")
    List<InventoryIssueItem> findAllWithDetails();

    @Query("SELECT i FROM InventoryIssueItem i JOIN FETCH i.item it JOIN FETCH it.category LEFT JOIN FETCH i.issuedBy WHERE i.id = :id")
    Optional<InventoryIssueItem> findDetailById(@Param("id") Long id);

    boolean existsByItem_Id(Long itemId);
}
