package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.OnlineCoursePurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OnlineCoursePurchaseRepository extends JpaRepository<OnlineCoursePurchase, Long> {

    @Query("""
            SELECT p FROM OnlineCoursePurchase p
            WHERE (:paymentType IS NULL OR :paymentType = '' OR LOWER(p.paymentType) = LOWER(:paymentType))
              AND (:paymentStatus IS NULL OR :paymentStatus = '' OR LOWER(p.paymentStatus) = LOWER(:paymentStatus))
              AND (:usersType IS NULL OR :usersType = '' OR :usersType = 'all' OR LOWER(p.usersType) = LOWER(:usersType))
              AND (:fromDate IS NULL OR p.purchaseDate >= :fromDate)
              AND (:toDate IS NULL OR p.purchaseDate <= :toDate)
            ORDER BY p.purchaseDate DESC, p.id DESC
            """)
    List<OnlineCoursePurchase> search(
            @Param("paymentType") String paymentType,
            @Param("paymentStatus") String paymentStatus,
            @Param("usersType") String usersType,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
