package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRoomRepository extends JpaRepository<HostelRoom, Long> {

    List<HostelRoom> findAllByOrderByIdDesc();

    Optional<HostelRoom> findByHostelIdAndRoomNumberIgnoreCase(Long hostelId, String roomNumber);

    boolean existsByHostelIdAndRoomNumberIgnoreCaseAndIdNot(Long hostelId, String roomNumber, Long id);
}
