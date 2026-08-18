package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {

    List<TransportRoute> findAllByOrderByTitleAsc();

    Optional<TransportRoute> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
