package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportRouteVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRouteVehicleRepository extends JpaRepository<TransportRouteVehicle, Long> {

    @Query("""
            SELECT rv FROM TransportRouteVehicle rv
            JOIN FETCH rv.route
            JOIN FETCH rv.vehicle
            ORDER BY rv.route.title ASC, rv.vehicle.vehicleNumber ASC
            """)
    List<TransportRouteVehicle> findAllWithDetails();

    @Query("""
            SELECT rv FROM TransportRouteVehicle rv
            JOIN FETCH rv.vehicle
            WHERE rv.route.id = :routeId
            ORDER BY rv.id ASC
            """)
    List<TransportRouteVehicle> findByRoute_IdWithVehicle(@Param("routeId") Long routeId);

    List<TransportRouteVehicle> findByRoute_Id(Long routeId);

    boolean existsByRoute_Id(Long routeId);

    boolean existsByVehicle_Id(Long vehicleId);

    void deleteByRoute_Id(Long routeId);
}
