package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.Hostel;
import com.kantechsolution.smart_school.model.HostelRoom;
import com.kantechsolution.smart_school.model.RoomType;
import com.kantechsolution.smart_school.repository.HostelRepository;
import com.kantechsolution.smart_school.repository.HostelRoomRepository;
import com.kantechsolution.smart_school.repository.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class HostelRoomService {

    @Autowired
    private HostelRoomRepository hostelRoomRepository;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    public List<Map<String, Object>> getAllRooms() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (HostelRoom row : hostelRoomRepository.findAllByOrderByIdDesc()) {
            result.add(toMap(row));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> createRoom(String roomNumber, Long hostelId, Long roomTypeId,
                                          String numberOfBed, String costPerBed, String description) {
        HostelRoom room = new HostelRoom();
        applyFields(room, roomNumber, hostelId, roomTypeId, numberOfBed, costPerBed, description, null);
        return toMap(hostelRoomRepository.save(room));
    }

    @Transactional
    public Map<String, Object> updateRoom(Long id, String roomNumber, Long hostelId, Long roomTypeId,
                                          String numberOfBed, String costPerBed, String description) {
        HostelRoom existing = hostelRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hostel room not found"));
        applyFields(existing, roomNumber, hostelId, roomTypeId, numberOfBed, costPerBed, description, id);
        return toMap(hostelRoomRepository.save(existing));
    }

    @Transactional
    public void deleteRoom(Long id) {
        if (!hostelRoomRepository.existsById(id)) {
            throw new IllegalArgumentException("Hostel room not found");
        }
        hostelRoomRepository.deleteById(id);
    }

    private void applyFields(HostelRoom room, String roomNumber, Long hostelId, Long roomTypeId,
                             String numberOfBed, String costPerBed, String description, Long currentId) {
        String number = roomNumber == null ? "" : roomNumber.trim();
        if (number.isEmpty()) {
            throw new IllegalArgumentException("Room Number / Name is required");
        }
        if (hostelId == null) {
            throw new IllegalArgumentException("Hostel is required");
        }
        if (roomTypeId == null) {
            throw new IllegalArgumentException("Room Type is required");
        }

        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new IllegalArgumentException("Selected hostel was not found"));
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Selected room type was not found"));

        Optional<HostelRoom> duplicate = hostelRoomRepository.findByHostelIdAndRoomNumberIgnoreCase(hostelId, number);
        if (duplicate.isPresent() && (currentId == null || !duplicate.get().getId().equals(currentId))) {
            throw new IllegalArgumentException("Room number already exists for this hostel");
        }

        Integer beds = parsePositiveInt(numberOfBed, "Number Of Bed");
        BigDecimal cost = parseMoney(costPerBed, "Cost Per Bed");

        room.setRoomNumber(number);
        room.setHostel(hostel);
        room.setRoomType(roomType);
        room.setNumberOfBed(beds);
        room.setCostPerBed(cost);
        room.setDescription(description == null ? "" : description.trim());
    }

    private Map<String, Object> toMap(HostelRoom row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("roomNumber", row.getRoomNumber());
        map.put("hostelId", row.getHostel() != null ? row.getHostel().getId() : null);
        map.put("hostelName", row.getHostel() != null ? row.getHostel().getHostelName() : null);
        map.put("roomTypeId", row.getRoomType() != null ? row.getRoomType().getId() : null);
        map.put("roomTypeName", row.getRoomType() != null ? row.getRoomType().getRoomType() : null);
        map.put("numberOfBed", row.getNumberOfBed());
        map.put("costPerBed", row.getCostPerBed());
        map.put("description", row.getDescription());
        return map;
    }

    private Integer parsePositiveInt(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            int parsed = Integer.parseInt(value.trim());
            if (parsed <= 0) {
                throw new IllegalArgumentException(fieldName + " must be greater than 0");
            }
            return parsed;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + " must be a valid number");
        }
    }

    private BigDecimal parseMoney(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            BigDecimal parsed = new BigDecimal(value.trim());
            if (parsed.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException(fieldName + " cannot be negative");
            }
            return parsed;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + " must be a valid amount");
        }
    }
}
