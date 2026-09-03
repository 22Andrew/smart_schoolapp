package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportVehicleRepository extends JpaRepository<TransportVehicle, Long> {

    List<TransportVehicle> findAllByOrderByVehicleNumberAsc();

    Optional<TransportVehicle> findByVehicleNumberIgnoreCase(String vehicleNumber);

    boolean existsByVehicleNumberIgnoreCaseAndIdNot(String vehicleNumber, Long id);
}
