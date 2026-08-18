package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportPickupPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportPickupPointRepository extends JpaRepository<TransportPickupPoint, Long> {

    List<TransportPickupPoint> findAllByOrderByNameAsc();

    Optional<TransportPickupPoint> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
