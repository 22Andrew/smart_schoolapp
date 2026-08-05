package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    List<RoomType> findAllByOrderByIdDesc();

    boolean existsByRoomTypeIgnoreCase(String roomType);

    Optional<RoomType> findByRoomTypeIgnoreCase(String roomType);
}
