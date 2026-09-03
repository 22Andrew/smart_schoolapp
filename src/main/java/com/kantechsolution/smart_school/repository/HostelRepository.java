package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long> {

    List<Hostel> findAllByOrderByIdDesc();

    boolean existsByHostelNameIgnoreCase(String hostelName);

    Optional<Hostel> findByHostelNameIgnoreCase(String hostelName);
}
