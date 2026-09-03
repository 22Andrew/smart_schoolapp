package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.RoomType;
import com.kantechsolution.smart_school.repository.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RoomTypeService {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAllByOrderByIdDesc();
    }

    public Optional<RoomType> getRoomTypeById(Long id) {
        return roomTypeRepository.findById(id);
    }

    @Transactional
    public RoomType createRoomType(String roomType, String description) {
        RoomType entity = new RoomType();
        applyFields(entity, roomType, description, null);
        return roomTypeRepository.save(entity);
    }

    @Transactional
    public RoomType updateRoomType(Long id, String roomType, String description) {
        RoomType existing = roomTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room type not found"));
        applyFields(existing, roomType, description, id);
        return roomTypeRepository.save(existing);
    }

    @Transactional
    public void deleteRoomType(Long id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Room type not found");
        }
        roomTypeRepository.deleteById(id);
    }

    private void applyFields(RoomType entity, String roomType, String description, Long currentId) {
        String name = roomType == null ? "" : roomType.trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Room Type is required");
        }

        Optional<RoomType> duplicate = roomTypeRepository.findByRoomTypeIgnoreCase(name);
        if (duplicate.isPresent() && (currentId == null || !duplicate.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("Room Type already exists");
        }

        entity.setRoomType(name);
        entity.setDescription(description == null ? "" : description.trim());
    }
}
