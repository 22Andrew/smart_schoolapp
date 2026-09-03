package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportRouteStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRouteStopRepository extends JpaRepository<TransportRouteStop, Long> {

    @Query("""
            SELECT s FROM TransportRouteStop s
            JOIN FETCH s.route
            JOIN FETCH s.pickupPoint
            ORDER BY s.route.title ASC, s.sortOrder ASC, s.id ASC
            """)
    List<TransportRouteStop> findAllWithDetails();

    @Query("""
            SELECT s FROM TransportRouteStop s
            JOIN FETCH s.route
            JOIN FETCH s.pickupPoint
            WHERE s.route.id = :routeId
            ORDER BY s.sortOrder ASC, s.id ASC
            """)
    List<TransportRouteStop> findByRoute_IdOrderBySortOrderAscIdAsc(@Param("routeId") Long routeId);

    boolean existsByRoute_Id(Long routeId);

    boolean existsByPickupPoint_Id(Long pickupPointId);

    void deleteByRoute_Id(Long routeId);
}
